"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update Firebase Auth profile
            await updateProfile(userCredential.user, { displayName: username });

            // Store additional user data in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                username,
                email,
                createdAt: new Date(),
                followers: [],
                following: []
            });

            router.push("/onboarding");
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg flex items-center justify-center p-6 min-h-[calc(100vh-73px)]">
            <div className="w-full max-w-md glass-panel p-10 animate-in slide-in-from-bottom-8 duration-700 ease-out border-t border-brand-blue/30 relative">

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black tracking-tighter text-brand-light mb-2">Join Watchly</h1>
                    <p className="text-brand-text font-medium">Create an account to start tracking, reviewing, and discovering films.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded text-sm mb-6 text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#89a] mb-2 pl-1">Username</label>
                        <input
                            type="text"
                            placeholder="cinephile99"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

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
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#89a] mb-2 pl-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary mt-8 btn-blue hover:text-brand-bg text-brand-bg flex justify-center items-center h-[52px]">
                        {loading ? <span className="w-5 h-5 border-2 border-brand-bg border-t-transparent rounded-full animate-spin"></span> : "Create Account"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-brand-text">
                        Already have an account? <Link href="/login" className="text-brand-light font-bold hover:text-brand-blue transition-colors border-b border-transparent hover:border-brand-blue ml-1 pb-0.5">Sign in</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
