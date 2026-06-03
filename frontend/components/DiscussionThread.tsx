import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, Timestamp, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import toast from "react-hot-toast";

interface Comment {
    id: string;
    mediaId: string;
    userId: string;
    userName: string;
    text: string;
    hasSpoiler?: boolean;
    isTrusted?: boolean;
    timestamp: any;
    upvotes?: string[];
    downvotes?: string[];
    parentId?: string | null;
}

export default function DiscussionThread({ mediaId }: { mediaId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [hasSpoiler, setHasSpoiler] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [trustedOnly, setTrustedOnly] = useState(false);
    const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<"new" | "top">("top");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    useEffect(() => {
        const q = query(
            collection(db, "comments"),
            where("mediaId", "==", mediaId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                upvotes: doc.data().upvotes || [],
                downvotes: doc.data().downvotes || [],
            })) as Comment[];
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [mediaId]);

    const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();
        if (!user || !newComment.trim() || submittingComment) return;

        setSubmittingComment(true);
        try {
            await addDoc(collection(db, "comments"), {
                mediaId: mediaId,
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0],
                text: newComment,
                hasSpoiler: hasSpoiler,
                isTrusted: Math.random() > 0.5, // Mock trust system for demo
                timestamp: Timestamp.now(),
                upvotes: [],
                downvotes: [],
                parentId: parentId
            });
            setNewComment("");
            setHasSpoiler(false);
            setReplyingTo(null);
            toast.success("Comment posted!");
        } catch (err) {
            console.error("Failed to post comment", err);
            toast.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleVote = async (commentId: string, type: "up" | "down") => {
        if (!user) {
            toast.error("You must be signed in to vote.");
            return;
        }

        const commentRef = doc(db, "comments", commentId);
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;

        const isUpvoted = comment.upvotes?.includes(user.uid);
        const isDownvoted = comment.downvotes?.includes(user.uid);

        try {
            if (type === "up") {
                if (isUpvoted) {
                    await updateDoc(commentRef, { upvotes: arrayRemove(user.uid) });
                } else {
                    await updateDoc(commentRef, { 
                        upvotes: arrayUnion(user.uid),
                        downvotes: arrayRemove(user.uid)
                    });
                }
            } else {
                if (isDownvoted) {
                    await updateDoc(commentRef, { downvotes: arrayRemove(user.uid) });
                } else {
                    await updateDoc(commentRef, { 
                        downvotes: arrayUnion(user.uid),
                        upvotes: arrayRemove(user.uid)
                    });
                }
            }
        } catch (err) {
            console.error("Error voting", err);
        }
    };

    // Sort and structure comments
    const topLevelComments = comments.filter(c => !c.parentId);
    
    const sortedComments = [...topLevelComments].sort((a, b) => {
        if (sortBy === "new") {
            return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
        } else {
            const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
            const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
            if (scoreA === scoreB) return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
            return scoreB - scoreA;
        }
    });

    const getReplies = (parentId: string) => {
        return comments.filter(c => c.parentId === parentId).sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
    };

    const renderComment = (comment: Comment, isReply: boolean = false) => {
        const isSpoiler = comment.hasSpoiler && !revealedSpoilers.has(comment.id);
        const score = (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0);
        const isUpvoted = user && comment.upvotes?.includes(user.uid);
        const isDownvoted = user && comment.downvotes?.includes(user.uid);

        if (trustedOnly && !comment.isTrusted) return null;

        return (
            <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4' : 'glass-panel p-5 bg-white/[0.02] border border-white/5 relative group mb-6'}`}>
                {/* Vote Column */}
                <div className="flex flex-col items-center gap-1 min-w-[32px]">
                    <button onClick={() => handleVote(comment.id, "up")} className={`hover:bg-white/10 p-1 rounded transition-colors ${isUpvoted ? 'text-brand-orange' : 'text-[#678]'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>
                    </button>
                    <span className={`text-xs font-black ${score > 0 ? 'text-brand-orange' : score < 0 ? 'text-[#00d2ff]' : 'text-brand-text'}`}>{score}</span>
                    <button onClick={() => handleVote(comment.id, "down")} className={`hover:bg-white/10 p-1 rounded transition-colors ${isDownvoted ? 'text-[#00d2ff]' : 'text-[#678]'}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
                    </button>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-brand-light font-bold text-sm">{comment.userName}</span>
                        {comment.isTrusted && <span className="bg-brand-green/20 text-brand-green text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider">Trusted</span>}
                        <span className="text-[10px] text-[#678] uppercase tracking-wider">• {comment.timestamp?.toDate().toLocaleDateString()}</span>
                    </div>

                    <div className="relative mb-3">
                        <p className={`text-brand-text-lighter text-sm leading-relaxed transition-all duration-300 ${isSpoiler ? 'blur-md select-none opacity-50' : ''}`}>
                            {comment.text}
                        </p>
                        {isSpoiler && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button 
                                    onClick={() => setRevealedSpoilers(new Set([...revealedSpoilers, comment.id]))}
                                    className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 hover:bg-black transition-all hover:border-[#00d2ff]/50 hover:text-[#00d2ff]"
                                >
                                    👁️ Reveal Spoiler
                                </button>
                            </div>
                        )}
                    </div>

                    {!isReply && (
                        <div className="flex items-center gap-4 text-xs font-bold text-[#678]">
                            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="hover:text-brand-light transition-colors flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Reply
                            </button>
                        </div>
                    )}

                    {replyingTo === comment.id && user && (
                        <form onSubmit={(e) => handleCommentSubmit(e, comment.id)} className="mt-4 flex flex-col items-end gap-2 animate-in slide-in-from-top-2 duration-300">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Replying to ${comment.userName}...`}
                                className="input-field min-h-[80px] text-sm resize-none w-full"
                                autoFocus
                            />
                            <div className="flex justify-between w-full items-center">
                                <label className="flex items-center gap-2 text-[#678] text-[10px] uppercase font-bold cursor-pointer hover:text-white transition-colors">
                                    <input type="checkbox" checked={hasSpoiler} onChange={(e) => setHasSpoiler(e.target.checked)} className="rounded border-white/20 bg-brand-panel/50 text-[#00d2ff]" />
                                    Contains Spoilers
                                </label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setReplyingTo(null)} className="text-xs font-bold text-[#678] hover:text-white px-3">Cancel</button>
                                    <button disabled={submittingComment || !newComment.trim()} className="bg-brand-blue text-white font-bold text-xs px-4 py-1.5 rounded-full hover:bg-brand-blue/80 disabled:opacity-50">
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Render nested replies */}
                    {!isReply && getReplies(comment.id).length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-white/5 space-y-2">
                            {getReplies(comment.id).map(reply => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="border-t border-white/10 pt-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-[#89a] tracking-widest uppercase">Discussions</h3>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                        <button onClick={() => setSortBy("top")} className={`text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full transition-all ${sortBy === "top" ? 'bg-white/10 text-white' : 'text-[#678] hover:text-white'}`}>Top</button>
                        <button onClick={() => setSortBy("new")} className={`text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full transition-all ${sortBy === "new" ? 'bg-white/10 text-white' : 'text-[#678] hover:text-white'}`}>New</button>
                    </div>

                    <button 
                        onClick={() => setTrustedOnly(!trustedOnly)}
                        className={`text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full transition-all ${trustedOnly ? 'bg-gradient-to-r from-brand-green to-brand-blue text-white shadow-[0_0_15px_rgba(0,224,84,0.3)] border-transparent' : 'border border-white/20 text-[#678] hover:text-white hover:border-white/40'}`}
                    >
                        🛡️ Trusted Only
                    </button>
                </div>
            </div>
            
            {user && !replyingTo ? (
                <form onSubmit={(e) => handleCommentSubmit(e)} className="mb-10">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Start a new discussion thread..."
                        className="input-field min-h-[100px] mb-4 text-sm resize-none"
                    />
                    <div className="flex justify-between items-center">
                        <label className="flex items-center gap-2 text-[#678] text-xs cursor-pointer hover:text-white transition-colors">
                            <input type="checkbox" checked={hasSpoiler} onChange={(e) => setHasSpoiler(e.target.checked)} className="rounded border-white/20 bg-brand-panel/50 text-[#00d2ff] focus:ring-[#00d2ff]/50" />
                            Contains Spoilers
                        </label>
                        <button 
                            disabled={submittingComment || !newComment.trim()}
                            className="btn-primary w-fit px-8 py-2.5 text-xs disabled:opacity-50 rounded-xl flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Post Thread
                        </button>
                    </div>
                </form>
            ) : !user && (
                <div className="glass-panel p-6 text-center mb-10 border-dashed">
                    <p className="text-brand-text text-sm mb-4">You must be signed in to join the discussion.</p>
                    <a href="/login" className="text-brand-green font-bold text-sm hover:underline">Sign In Now</a>
                </div>
            )}

            <div className="space-y-2">
                {sortedComments.map(comment => renderComment(comment))}
                {comments.length === 0 && (
                    <p className="text-center text-[#678] text-sm py-10 italic">No discussions yet. Be the first to start a thread!</p>
                )}
            </div>
        </div>
    );
}
