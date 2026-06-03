import { NextResponse } from "next/server";
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { likedMovieIds = [], excludeIds = [] } = body;
        
        const apiKey = process.env.TMDB_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
        }

        if (likedMovieIds.length === 0) {
            return NextResponse.json({ results: [] });
        }

        // Shuffle and limit to up to 4 movies to use as seed to avoid TMDB rate limiting
        // We shuffle so that the recommendations feel fresh rather than always basing off the same movies
        const shuffled = [...likedMovieIds].sort(() => 0.5 - Math.random());
        const sampleIds = shuffled.slice(0, 4);
        
        // Fetch recommendations for each sampled movie concurrently
        const recommendationPromises = sampleIds.map((id: number) => 
            fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${apiKey}&language=en-US&page=1`, { 
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            })
            .then(res => {
                if (!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then(data => data.results)
            .catch(() => []) // Silently ignore failures for a single movie
        );

        const resultsArrays = await Promise.all(recommendationPromises);
        
        // Aggregate and score using an item-based collaborative content-filtering approach
        const recommendationMap = new Map<number, any>();
        
        resultsArrays.forEach((results) => {
            results.forEach((movie: any) => {
                if (excludeIds.includes(movie.id)) return; // Filter out seen/liked movies
                
                if (recommendationMap.has(movie.id)) {
                    const existing = recommendationMap.get(movie.id);
                    // Boost score heavily if recommended by multiple seed movies (Co-occurrence)
                    existing.cfScore += 2; 
                } else {
                    recommendationMap.set(movie.id, {
                        ...movie,
                        cfScore: 1 // Base score
                    });
                }
            });
        });

        // Add popularity and vote_average to the weighting
        const sortedRecommendations = Array.from(recommendationMap.values())
            .sort((a, b) => {
                // Primary: Co-occurrence score
                if (b.cfScore !== a.cfScore) return b.cfScore - a.cfScore; 
                // Secondary: TMDB Vote Average 
                if (b.vote_average !== a.vote_average) return b.vote_average - a.vote_average;
                // Tertiary: Overall Popularity
                return b.popularity - a.popularity; 
            })
            .slice(0, 10); // Return top 10 matches

        return NextResponse.json({ results: sortedRecommendations });
    } catch (error: any) {
        console.error("Recommendations API Error:", error.message);
        return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
    }
}
