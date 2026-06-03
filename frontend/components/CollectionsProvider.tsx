"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CollectionsContextType {
    isCollectionsModalOpen: boolean;
    openCollectionsModal: () => void;
    closeCollectionsModal: () => void;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openCollectionsModal = () => setIsOpen(true);
    const closeCollectionsModal = () => setIsOpen(false);

    return (
        <CollectionsContext.Provider value={{
            isCollectionsModalOpen: isOpen,
            openCollectionsModal,
            closeCollectionsModal
        }}>
            {children}
        </CollectionsContext.Provider>
    );
}

export function useCollections() {
    const context = useContext(CollectionsContext);
    if (context === undefined) {
        throw new Error("useCollections must be used within a CollectionsProvider");
    }
    return context;
}
