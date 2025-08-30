import React from 'react';
import type { User } from '../App';
import { GoogleIcon, CloseIcon } from './icons';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
}

const mockUsers: User[] = [
    { name: 'Alex Johnson', email: 'alex.j@example.com', avatar: 'AJ' },
    { name: 'Maria Garcia', email: 'maria.g@example.com', avatar: 'MG' },
    { name: 'Kenji Tanaka', email: 'kenji.t@example.com', avatar: 'KT' },
];

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm m-4 text-slate-200 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in [animation-fill-mode:forwards] [animation-delay:0.1s]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <GoogleIcon className="w-7 h-7" />
                        <h2 className="text-xl font-bold">Sign in with Google</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" aria-label="Close login modal">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4">
                     <p className="text-center text-slate-400 text-sm mb-4">Choose an account to continue</p>
                    <div className="flex flex-col gap-2">
                        {mockUsers.map((user) => (
                            <button 
                                key={user.email} 
                                onClick={() => onLoginSuccess(user)}
                                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold text-white">
                                    {user.avatar}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-100">{user.name}</p>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-slate-900/50 rounded-b-2xl text-center">
                    <p className="text-xs text-slate-500">
                        This is a simulated login. In a real application, you would be redirected to Google.
                    </p>
                </div>
            </div>
        </div>
    );
};