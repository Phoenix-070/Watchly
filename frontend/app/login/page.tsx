"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg flex items-center justify-center p-6 min-h-[calc(100vh-73px)]">
            <div className="w-full max-w-md glass-panel p-10 animate-in slide-in-from-bottom-8 duration-700 ease-out border-t border-brand-green/30 relative">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tighter text-brand-light mb-2">Welcome Back</h1>
                    <p className="text-brand-text font-medium">Sign in to log your films, write reviews, and see what your friends are watching.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#89a] mb-2 pl-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 pl-1 pr-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-[#89a]">Password</label>
                            <Link href="#" className="text-xs font-semibold text-brand-blue hover:text-brand-light transition-colors">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary mt-8 flex justify-center items-center h-[52px]">
                        {loading ? <span className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></span> : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-brand-text">
                        Don&apos;t have an account? <Link href="/register" className="text-brand-light font-bold hover:text-brand-green transition-colors border-b border-transparent hover:border-brand-green ml-1 pb-0.5">Create one now</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
