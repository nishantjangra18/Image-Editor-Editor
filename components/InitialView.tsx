import React from 'react';
import { PencilIcon, TypeIcon } from './icons';

interface InitialViewProps {
    onGenerateClick: () => void;
    onEditClick: () => void;
}

export const InitialView: React.FC<InitialViewProps> = ({ onGenerateClick, onEditClick }) => {
    return (
        <>
            <p className="text-center mt-2 text-slate-400 -mt-6 mb-8">
                Choose an option to start creating your image.
            </p>
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in text-center">
                <button onClick={onGenerateClick} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-4 items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:border-cyan-500/50 hover:-translate-y-1">
                    <TypeIcon className="w-12 h-12 text-cyan-400"/>
                    <h2 className="text-xl font-bold text-slate-200">Generate New Image</h2>
                    <p className="text-slate-400">Create an image from a text description.</p>
                </button>
                <button onClick={onEditClick} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-4 items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:border-cyan-500/50 hover:-translate-y-1">
                    <PencilIcon className="w-12 h-12 text-teal-400"/>
                    <h2 className="text-xl font-bold text-slate-200">Edit Existing Image</h2>
                    <p className="text-slate-400">Upload your own image to modify.</p>
                </button>
            </div>
        </>
    );
};