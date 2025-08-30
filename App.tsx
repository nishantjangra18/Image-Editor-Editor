import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImageContainer } from './components/ImageContainer';
import { WandIcon, DownloadIcon, SparklesIcon } from './components/icons';
import { editImage, generateImage } from './services/geminiService';
import { fileToBase64, dataURLtoFile } from './utils/fileUtils';
import { Navbar } from './components/Navbar';
import { HistoryView } from './components/HistoryView';
import { InitialView } from './components/InitialView';
import { LoginModal } from './components/LoginModal';

type AppMode = 'initial' | 'edit' | 'generate' | 'history';
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface User {
    name: string;
    email: string;
    avatar: string; // URL or initial
}

const App: React.FC = () => {
    const [appMode, setAppMode] = useState<AppMode>('initial');

    // History State
    const [history, setHistory] = useState<string[]>([]);

    // Login State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Edit Mode State
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Generate Mode State
    const [generatePrompt, setGeneratePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generateError, setGenerateError] = useState<string | null>(null);
    
    // Load history from localStorage when user logs in or on initial mount
    useEffect(() => {
        if (!currentUser) {
            setHistory([]); // Clear history if no user is logged in
            return;
        }
        try {
            const storedHistory = localStorage.getItem(`imageHistory_${currentUser.email}`);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            } else {
                setHistory([]);
            }
        } catch (err) {
            console.error("Failed to load history from localStorage", err);
            setHistory([]);
        }
    }, [currentUser]);

    // Save history to localStorage whenever it changes for the current user
    useEffect(() => {
        if (!currentUser) return;
        try {
            localStorage.setItem(`imageHistory_${currentUser.email}`, JSON.stringify(history));
        } catch (err) {
            console.error("Failed to save history to localStorage", err);
        }
    }, [history, currentUser]);


    const suggestionPrompts = [
        "Add a beautiful sunset sky.",
        "Change the season to winter and add snow.",
        "Place a majestic castle in the background.",
        "Make it look like a vintage photograph from the 1970s.",
        "Turn this into a fantasy landscape with glowing mushrooms.",
    ];

    const handleImageSelect = useCallback((file: File) => {
        setOriginalFile(file);
        setEditedImageUrl(null);
        setError(null);
        setPrompt('');
        setWidth('');
        setHeight('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);
    
    const handleGoHome = () => {
        setAppMode('initial');
        // Reset edit state
        setOriginalFile(null);
        setOriginalImagePreview(null);
        setEditedImageUrl(null);
        setError(null);
        setPrompt('');
        setWidth('');
        setHeight('');
        setIsLoading(false);
        // Reset generate state
        setGeneratePrompt('');
        setAspectRatio('1:1');
        setGeneratedImageUrl(null);
        setIsGenerating(false);
        setGenerateError(null);
    };

    const handleSelectHistoryImage = (imageUrl: string) => {
        const file = dataURLtoFile(imageUrl, `history-image-${Date.now()}.png`);
        handleImageSelect(file);
        setAppMode('edit');
    };

    const handleDownload = (url: string | null) => {
        if (!url) return;

        const link = document.createElement('a');
        link.href = url;

        const mimeTypePart = url.split(';')[0];
        const mimeType = mimeTypePart ? mimeTypePart.split(':')[1] : null;
        const extension = mimeType ? mimeType.split('/')[1] : 'png';
        
        link.download = `generated-image.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        setShowLoginModal(false);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        handleGoHome(); // Also reset view to initial
    };
    
    const addImageToHistory = (imageUrl: string) => {
        if(!currentUser) return; // Don't save history if not logged in
        setHistory(prev => [imageUrl, ...prev.filter(h => h !== imageUrl)]);
    }

    const handleSubmitEdit = async () => {
        if (!originalFile) return;

        if (!prompt && (!width || !height)) {
            setError("Please enter a prompt or specify a target resolution.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);

        try {
            const targetWidth = width ? parseInt(width, 10) : undefined;
            const targetHeight = height ? parseInt(height, 10) : undefined;
            const { base64, mimeType } = await fileToBase64(originalFile);
            const resultUrl = await editImage(base64, mimeType, prompt, targetWidth, targetHeight);
            setEditedImageUrl(resultUrl);
            addImageToHistory(resultUrl);
        } catch (e) {
            const err = e instanceof Error ? e.message : "An unexpected error occurred.";
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSubmitGenerate = async () => {
        if (!generatePrompt) {
            setGenerateError("Please enter a prompt.");
            return;
        }
        setIsGenerating(true);
        setGenerateError(null);
        setGeneratedImageUrl(null);
        try {
            const resultUrl = await generateImage(generatePrompt, aspectRatio);
            setGeneratedImageUrl(resultUrl);
            addImageToHistory(resultUrl);
        } catch (e) {
            const err = e instanceof Error ? e.message : "An unexpected error occurred.";
            setGenerateError(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const canSubmitEdit = !isLoading && (!!prompt || (!!width && !!height));
    const canSubmitGenerate = !isGenerating && !!generatePrompt;

    const renderContent = () => {
        switch(appMode) {
            case 'initial':
                return <InitialView onEditClick={() => setAppMode('edit')} onGenerateClick={() => setAppMode('generate')} />;
            case 'history':
                return <HistoryView images={history} onImageSelect={handleSelectHistoryImage} isLoggedIn={!!currentUser} />;
            case 'edit':
                return !originalImagePreview ? (
                    <ImageUploader onImageSelect={handleImageSelect} />
                ) : (
                    <div className="flex flex-col gap-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ImageContainer title="Original Image" imageUrl={originalImagePreview} />
                            <ImageContainer title="Edited Image" imageUrl={editedImageUrl} isLoading={isLoading} />
                        </div>

                        {error && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in">
                                <p><strong>Error:</strong> {error}</p>
                            </div>
                        )}

                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-4">
                            <div className="flex flex-col gap-4">
                                <div className="relative">
                                    <label htmlFor="prompt" className="sr-only">Prompt</label>
                                    <input
                                        id="prompt"
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., 'Make the sky a vibrant sunset...'"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="width" className="block text-sm font-medium text-slate-400 mb-1">Target Width (optional)</label>
                                        <input
                                            id="width"
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                            placeholder="e.g., 1920"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            disabled={isLoading}
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="height" className="block text-sm font-medium text-slate-400 mb-1">Target Height (optional)</label>
                                        <input
                                            id="height"
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            placeholder="e.g., 1080"
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                            disabled={isLoading}
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 items-start pt-2">
                                 <div className="flex items-center gap-2 text-slate-400 text-sm whitespace-nowrap pt-1.5">
                                     <SparklesIcon className="w-4 h-4" />
                                     <span>Suggestions:</span>
                                 </div>
                                 <div className="flex flex-wrap gap-2">
                                    {suggestionPrompts.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPrompt(p)}
                                            disabled={isLoading}
                                            className="px-3 py-1 bg-slate-700/80 text-slate-300 rounded-full text-sm hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
                                <button
                                    onClick={handleSubmitEdit}
                                    disabled={!canSubmitEdit}
                                    className="w-full sm:w-auto flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                >
                                    <WandIcon className="w-5 h-5 mr-2"/>
                                    {isLoading ? 'Generating...' : 'Generate'}
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="w-full sm:w-auto px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                >
                                    Start Over
                                </button>
                                {editedImageUrl && (
                                    <button
                                        onClick={() => handleDownload(editedImageUrl)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                        aria-label="Download edited image"
                                    >
                                        <DownloadIcon className="w-5 h-5 mr-2" />
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'generate':
                 return (
                    <div className="flex flex-col gap-8 animate-fade-in max-w-4xl mx-auto">
                        <ImageContainer title="Generated Image" imageUrl={generatedImageUrl} isLoading={isGenerating} />
                        
                        {generateError && (
                            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in">
                                <p><strong>Error:</strong> {generateError}</p>
                            </div>
                        )}

                         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="generate-prompt" className="block text-sm font-medium text-slate-400 mb-1">Prompt</label>
                                    <input
                                        id="generate-prompt"
                                        type="text"
                                        value={generatePrompt}
                                        onChange={(e) => setGeneratePrompt(e.target.value)}
                                        placeholder="A futuristic city with flying cars at sunset..."
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        disabled={isGenerating}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-400 mb-1">Aspect Ratio</label>
                                    <select 
                                        id="aspect-ratio"
                                        value={aspectRatio}
                                        onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                                        disabled={isGenerating}
                                    >
                                        <option value="1:1">Square (1:1)</option>
                                        <option value="16:9">Widescreen (16:9)</option>
                                        <option value="9:16">Portrait (9:16)</option>
                                        <option value="4:3">Standard (4:3)</option>
                                        <option value="3:4">Tall (3:4)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700/50">
                                    <button
                                        onClick={handleSubmitGenerate}
                                        disabled={!canSubmitGenerate}
                                        className="w-full sm:w-auto flex-grow inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                    >
                                        <WandIcon className="w-5 h-5 mr-2"/>
                                        {isGenerating ? 'Generating...' : 'Generate Image'}
                                    </button>
                                    <button
                                        onClick={handleGoHome}
                                        className="w-full sm:w-auto px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                    >
                                        Start Over
                                    </button>
                                    {generatedImageUrl && (
                                        <button
                                            onClick={() => handleDownload(generatedImageUrl)}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all duration-200 transform hover:-translate-y-px active:scale-95"
                                            aria-label="Download generated image"
                                        >
                                            <DownloadIcon className="w-5 h-5 mr-2" />
                                            Download
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <>
            <div className="min-h-screen bg-transparent text-slate-200 font-sans p-4 sm:p-6 lg:p-8 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-grow">
                    <Navbar 
                        onHomeClick={handleGoHome} 
                        onHistoryClick={() => setAppMode('history')}
                        currentUser={currentUser}
                        onLogin={() => setShowLoginModal(true)}
                        onLogout={handleLogout}
                    />
                    <main className="mt-8">
                       {renderContent()}
                    </main>
                </div>
                 <footer className="w-full text-center text-slate-500 text-sm py-4 mt-8 border-t border-slate-800">
                    <p>&copy; {new Date().getFullYear()} Image Editor & Generator. All Rights Reserved.</p>
                    <p className="mt-1">Made by Nishant Jangra</p>
                </footer>
            </div>
            {showLoginModal && (
                <LoginModal 
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
};

export default App;