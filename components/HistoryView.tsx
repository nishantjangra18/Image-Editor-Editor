import React from 'react';
import { UserIcon } from './icons';

interface HistoryViewProps {
    images: string[];
    onImageSelect: (imageUrl: string) => void;
    isLoggedIn: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ images, onImageSelect, isLoggedIn }) => {
    if (!isLoggedIn) {
        return (
             <div className="text-center text-slate-400 animate-fade-in p-8 bg-slate-800/50 rounded-xl border border-slate-700 max-w-md mx-auto">
                <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-500"/>
                <h3 className="text-xl font-bold text-slate-200 mb-2">Login to View History</h3>
                <p>Please log in to see your saved image history and continue your work.</p>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-200 mb-6 text-center">Your Image History</h2>
            {images.length === 0 ? (
                <p className="text-slate-400 text-center">
                    You haven't generated any images yet. Your creations will appear here.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((imgSrc, index) => (
                        <div
                            key={index}
                            className="bg-slate-800/50 rounded-lg overflow-hidden cursor-pointer group relative border-2 border-transparent hover:border-cyan-500 transition-all duration-300"
                            onClick={() => onImageSelect(imgSrc)}
                        >
                            <img
                                src={imgSrc}
                                alt={`History item ${index + 1}`}
                                className="aspect-square object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white font-semibold">Edit Image</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};