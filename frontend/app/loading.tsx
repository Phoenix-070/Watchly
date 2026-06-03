export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="animate-pulse flex space-x-4 mb-10">
                <div className="h-8 bg-white/10 rounded w-1/4"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-white/5 rounded-md animate-pulse border border-white/5 shadow-lg"></div>
                ))}
            </div>
        </div>
    );
}
