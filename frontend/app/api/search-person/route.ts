import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/person?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}&language=en-US&page=1`);
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to search person' }, { status: response.status });
        }

        const data = await response.json();
        const results = data.results.slice(0, 6).map((p: any) => ({
            id: p.id,
            name: p.name,
            profile_path: p.profile_path,
            known_for_department: p.known_for_department,
            popularity: p.popularity
        })).sort((a: any, b: any) => b.popularity - a.popularity);

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Error searching person:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
