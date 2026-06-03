"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

const GENRES = ["Action", "Sci-Fi", "Romance", "Horror", "Comedy", "Drama", "Thriller", "Animation", "Documentary", "Fantasy", "Mystery", "Western"];
const LANGUAGES = ["English", "Spanish", "Korean", "Japanese", "French", "Hindi", "German", "Italian", "Mandarin", "Tamil"];

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        genres: [] as string[],
        languages: [] as string[],
        actors: [] as string[],
        directors: [] as string[]
    });
    
    const [actorInput, setActorInput] = useState("");
    const [directorInput, setDirectorInput] = useState("");
    
    const [actorSuggestions, setActorSuggestions] = useState<any[]>([]);
    const [directorSuggestions, setDirectorSuggestions] = useState<any[]>([]);
    
    const [saving, setSaving] = useState(false);

    // Fetch existing preferences if updating
    useEffect(() => {
        const fetchExistingPreferences = async () => {
            if (user) {
                try {
                    const userSnap = await getDoc(doc(db, "users", user.uid));
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        if (data.preferences) {
                            setPreferences({
                                genres: data.preferences.genres || [],
                                languages: data.preferences.languages || [],
                                actors: data.preferences.actors || [],
                                directors: data.preferences.directors || []
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to load existing preferences", err);
                }
            }
        };
        fetchExistingPreferences();
    }, [user]);

    // Debounced search for actors
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (actorInput.trim().length > 1) {
                try {
                    const res = await fetch(`/api/search-person?query=${encodeURIComponent(actorInput)}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Only suggest people primarily known for acting
                        setActorSuggestions(data.results.filter((p: any) => p.known_for_department === 'Acting'));
                    }
                } catch (err) {
                    console.error("Failed to fetch actors", err);
                }
            } else {
                setActorSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [actorInput]);

    // Debounced search for directors
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (directorInput.trim().length > 1) {
                try {
                    const res = await fetch(`/api/search-person?query=${encodeURIComponent(directorInput)}`);
                    if (res.ok) {
                        const data = await res.json();
                        // Suggest people known for directing (or production sometimes overlaps)
                        setDirectorSuggestions(data.results.filter((p: any) => p.known_for_department === 'Directing' || p.known_for_department === 'Production' || p.known_for_department === 'Writing'));
                    }
                } catch (err) {
                    console.error("Failed to fetch directors", err);
                }
            } else {
                setDirectorSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [directorInput]);

    const toggleSelection = (category: 'genres' | 'languages', item: string) => {
        setPreferences(prev => {
            const current = prev[category];
            if (current.includes(item)) {
                return { ...prev, [category]: current.filter(i => i !== item) };
            } else {
                return { ...prev, [category]: [...current, item] };
            }
        });
    };

    const handleAddTag = (category: 'actors' | 'directors', value: string, setter: (val: string) => void, suggestionsSetter?: (val: any[]) => void) => {
        if (!value.trim()) return;
        setPreferences(prev => {
            if (prev[category].includes(value.trim())) return prev;
            return {
                ...prev,
                [category]: [...prev[category], value.trim()]
            };
        });
        setter("");
        if (suggestionsSetter) suggestionsSetter([]);
    };

    const handleRemoveTag = (category: 'actors' | 'directors', index: number) => {
        setPreferences(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index)
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, category: 'actors' | 'directors', value: string, setter: (val: string) => void, suggestionsSetter: (val: any[]) => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag(category, value, setter, suggestionsSetter);
        }
    };

    const handleFinish = async () => {
        if (!user) {
            router.push("/");
            return;
        }

        setSaving(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                preferences,
                onboardingCompleted: true
            });
            router.push("/");
        } catch (error) {
            console.error("Failed to save preferences", error);
            setSaving(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    if (!user) return <div className="min-h-screen flex items-center justify-center text-brand-text">Please log in first...</div>;

    return (
        <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-2xl relative z-10">
                
                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3, 4].map(idx => (
                        <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= idx ? 'bg-gradient-to-r from-[#00d2ff] to-[#0052D4] shadow-[0_0_10px_rgba(0,210,255,0.5)]' : 'bg-white/10'}`}></div>
                    ))}
                </div>

                <div className="glass-panel p-8 md:p-12 min-h-[450px] flex flex-col relative border border-white/10 shadow-2xl rounded-3xl">
                    <AnimatePresence mode="wait">
                        
                        {/* Step 1: Genres */}
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col flex-1"
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">What do you like to watch?</h1>
                                <p className="text-brand-text mb-8">Select your favorite genres to help us curate your homepage.</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {GENRES.map(genre => {
                                        const isSelected = preferences.genres.includes(genre);
                                        return (
                                            <button
                                                key={genre}
                                                onClick={() => toggleSelection('genres', genre)}
                                                className={`px-5 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${isSelected ? 'bg-brand-blue/20 border-brand-blue text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.3)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
                                            >
                                                {genre}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Languages */}
                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col flex-1"
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Preferred Languages</h1>
                                <p className="text-brand-text mb-8">What languages do you typically watch content in?</p>
                                
                                <div className="flex flex-wrap gap-3">
                                    {LANGUAGES.map(lang => {
                                        const isSelected = preferences.languages.includes(lang);
                                        return (
                                            <button
                                                key={lang}
                                                onClick={() => toggleSelection('languages', lang)}
                                                className={`px-5 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${isSelected ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
                                            >
                                                {lang}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Actors */}
                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col flex-1"
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Favorite Actors</h1>
                                <p className="text-brand-text mb-8">Type an actor's name to search and add them.</p>
                                
                                <div className="relative mb-6">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={actorInput}
                                            onChange={(e) => setActorInput(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, 'actors', actorInput, setActorInput, setActorSuggestions)}
                                            placeholder="e.g. Leonardo DiCaprio"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-brand-orange/50 transition-colors"
                                        />
                                        <button 
                                            onClick={() => handleAddTag('actors', actorInput, setActorInput, setActorSuggestions)}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-bold transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    
                                    {/* Actor Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {actorSuggestions.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#1a1c23] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                                            >
                                                {actorSuggestions.map(person => (
                                                    <div 
                                                        key={person.id}
                                                        onClick={() => handleAddTag('actors', person.name, setActorInput, setActorSuggestions)}
                                                        className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-none"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                            {person.profile_path ? (
                                                                <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-white text-sm">{person.name}</div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {preferences.actors.map((actor, idx) => (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                key={actor + idx} 
                                                className="flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/30 text-brand-orange px-4 py-2 rounded-full text-sm font-bold"
                                            >
                                                {actor}
                                                <button onClick={() => handleRemoveTag('actors', idx)} className="text-brand-orange hover:text-white transition-colors ml-1">&times;</button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Directors */}
                        {step === 4 && (
                            <motion.div 
                                key="step4"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col flex-1"
                            >
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Favorite Directors</h1>
                                <p className="text-brand-text mb-8">Who are the visionaries you love? Search to add them.</p>
                                
                                <div className="relative mb-6">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={directorInput}
                                            onChange={(e) => setDirectorInput(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, 'directors', directorInput, setDirectorInput, setDirectorSuggestions)}
                                            placeholder="e.g. Christopher Nolan"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#ff0055]/50 transition-colors"
                                        />
                                        <button 
                                            onClick={() => handleAddTag('directors', directorInput, setDirectorInput, setDirectorSuggestions)}
                                            className="absolute right-2 top-2 bottom-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-bold transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Director Suggestions Dropdown */}
                                    <AnimatePresence>
                                        {directorSuggestions.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#1a1c23] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                                            >
                                                {directorSuggestions.map(person => (
                                                    <div 
                                                        key={person.id}
                                                        onClick={() => handleAddTag('directors', person.name, setDirectorInput, setDirectorSuggestions)}
                                                        className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-none"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                                            {person.profile_path ? (
                                                                <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                                                            )}
                                                        </div>
                                                        <div className="font-bold text-white text-sm">{person.name}</div>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence>
                                        {preferences.directors.map((director, idx) => (
                                            <motion.div 
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                key={director + idx} 
                                                className="flex items-center gap-2 bg-[#ff0055]/20 border border-[#ff0055]/30 text-[#ff0055] px-4 py-2 rounded-full text-sm font-bold"
                                            >
                                                {director}
                                                <button onClick={() => handleRemoveTag('directors', idx)} className="text-[#ff0055] hover:text-white transition-colors ml-1">&times;</button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-auto pt-8 flex items-center justify-between relative z-0">
                        {step > 1 ? (
                            <button onClick={prevStep} className="text-brand-text hover:text-white text-sm font-bold tracking-widest uppercase transition-colors px-4 py-2">
                                Back
                            </button>
                        ) : <div></div>}
                        
                        {step < 4 ? (
                            <button onClick={nextStep} className="btn-primary py-3 px-8 text-sm font-bold">
                                Continue
                            </button>
                        ) : (
                            <button onClick={handleFinish} disabled={saving} className="btn-primary py-3 px-8 text-sm font-bold bg-gradient-to-r from-[#00d2ff] to-[#0052D4] border-none shadow-[0_0_20px_rgba(0,210,255,0.4)]">
                                {saving ? "Saving..." : "Finish & Explore"}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
