"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export default function HeaderAuth() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="animate-pulse w-20 h-8 bg-white/5 rounded"></div>;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-6">
                <Link href="/login" className="hover:text-brand-light transition-colors py-2">Sign In</Link>
                <Link href="/register" className="bg-brand-green/10 text-brand-green px-4 py-2 rounded border border-brand-green/30 hover:bg-brand-green hover:text-brand-bg transition-colors shadow-[0_0_10px_rgba(0,224,84,0.15)]">Create Account</Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6">
            <Link href="/profile" className="flex items-center gap-2 group cursor-pointer relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center text-brand-bg font-black text-xs shadow-[0_0_10px_rgba(64,188,244,0.3)] group-hover:scale-110 transition-transform">
                    {user.email?.[0].toUpperCase() || "U"}
                </div>
                <span className="text-brand-light font-bold text-xs group-hover:text-brand-blue transition-colors">
                    {user.displayName || user.email?.split('@')[0]}
                </span>
            </Link>
        </div>
    );
}
