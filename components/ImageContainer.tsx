import React from 'react';
import { Loader } from './Loader';
import { ImageIcon } from './icons';

interface ImageContainerProps {
    title: string;
    imageUrl: string | null;
    isLoading?: boolean;
}

export const ImageContainer: React.FC<ImageContainerProps> = ({ title, imageUrl, isLoading = false }) => {
    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:border-cyan-500/50">
            <h2 className="text-lg font-bold text-slate-300 text-center">{title}</h2>
            <div className="bg-slate-900/70 rounded-lg overflow-hidden">
                 {isLoading ? (
                    <div className="min-h-[250px] flex items-center justify-center">
                        <Loader />
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-auto block animate-fade-in" />
                ) : (
                    <div className="min-h-[250px] flex items-center justify-center">
                        <div className="text-slate-600 flex flex-col items-center">
                            <ImageIcon className="w-16 h-16" />
                            <p>Your image will appear here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};