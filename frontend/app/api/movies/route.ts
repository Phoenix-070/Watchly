import { NextResponse } from "next/server";
import { fetchTMDB } from "../../../lib/tmdb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "popular";
    const mediaType = searchParams.get("media_type") || "movie";
    const query = searchParams.get("q");
    const id = searchParams.get("id");

    try {
        let data;

        if (type === "search" && query) {
            data = await fetchTMDB("/search/multi", { query });
        } else if (type === "details" && id) {
            data = await fetchTMDB(`/${mediaType}/${id}`, { append_to_response: "credits,videos,watch/providers" });
        } else if (type === "upcoming") {
            const endpoint = mediaType === "tv" ? "on_the_air" : "upcoming";
            data = await fetchTMDB(`/${mediaType}/${endpoint}`);
        } else if (type === "now_playing") {
            const endpoint = mediaType === "tv" ? "airing_today" : "now_playing";
            data = await fetchTMDB(`/${mediaType}/${endpoint}`);
        } else if (type === "top_rated") {
            data = await fetchTMDB(`/${mediaType}/top_rated`);
        } else if (type === "discover") {
            const genre = searchParams.get("with_genres");
            const year = searchParams.get("primary_release_year");
            const sortBy = searchParams.get("sort_by") || "popularity.desc";
            
            const params: Record<string, string> = { sort_by: sortBy };
            if (genre) params.with_genres = genre;
            if (year) {
                if (mediaType === "tv") params.first_air_date_year = year;
                else params.primary_release_year = year;
            }
            data = await fetchTMDB(`/discover/${mediaType}`, params);
        } else {
            data = await fetchTMDB(`/${mediaType}/popular`);
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("TMDB API Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
    }
}