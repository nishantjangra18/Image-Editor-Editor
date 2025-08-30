import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, HistoryIcon, GoogleIcon, UserIcon, LogoutIcon } from './icons';
import type { User } from '../App';

interface NavbarProps {
    onHomeClick: () => void;
    onHistoryClick: () => void;
    currentUser: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, onHistoryClick, currentUser, onLogin, onLogout }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <header className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex justify-between items-center shadow-lg backdrop-blur-sm sticky top-4 z-10">
            <div 
                className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 cursor-pointer py-1"
                onClick={onHomeClick}
            >
                Image Editor & Generator
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
                <button 
                    onClick={onHomeClick} 
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    aria-label="Go to Home page"
                >
                    <HomeIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Home</span>
                </button>
                <button 
                    onClick={onHistoryClick} 
                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200"
                    aria-label="View image history"
                >
                    <HistoryIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">History</span>
                </button>
                <div className="h-6 w-px bg-slate-600"></div> {/* Divider */}
                {currentUser ? (
                     <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setIsDropdownOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500">
                             <UserIcon className="w-6 h-6 text-slate-300" />
                        </button>
                        {isDropdownOpen && (
                             <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 animate-fade-in z-20">
                                 <div className="px-4 py-2 text-sm text-slate-400">
                                    <p className="font-semibold text-slate-200">{currentUser.name}</p>
                                    <p className="truncate">{currentUser.email}</p>
                                </div>
                                <div className="border-t border-slate-700 my-1"></div>
                                <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors">
                                    <LogoutIcon className="w-4 h-4" />
                                    Logout
                                </button>
                             </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={onLogin}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200"
                        aria-label="Login with Google"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="text-slate-200 font-medium hidden sm:inline">Login with Google</span>
                    </button>
                )}
            </nav>
        </header>
    );
};