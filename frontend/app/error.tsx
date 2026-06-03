"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-3xl font-black text-brand-light mb-4 tracking-tight">Something went wrong!</h2>
            <p className="text-brand-text mb-8">We couldn&apos;t load this page. Please try again.</p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-brand-green/10 border border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-brand-bg transition-colors rounded-full font-bold uppercase tracking-widest text-xs"
            >
                Try Again
            </button>
        </div>
    );
}
