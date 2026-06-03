"use client";

import { useCollections } from "./CollectionsProvider";

export default function CollectionsNavButton() {
    const { openCollectionsModal } = useCollections();

    return (
        <button 
            onClick={openCollectionsModal}
            className="p-2.5 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 hover:bg-brand-green hover:text-[#0b0f14] hover:shadow-[0_0_15px_rgba(0,224,84,0.4)] transition-all duration-300 group"
            title="Open Collections Workspace"
        >
            <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        </button>
    );
}
