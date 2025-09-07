
import React, { useState, useRef, useEffect } from 'react';
import Loader from './Loader';
import type { PanelDescription } from '../types';

declare const JSZip: any;

interface ComicPage {
  imageUrl: string;
  imageBase64: string;
  mimeType: string;
}

interface StoryboardProps {
  comicPage: ComicPage | null;
  panelDescriptions: PanelDescription[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

const Storyboard: React.FC<StoryboardProps> = ({ comicPage, panelDescriptions, isLoading, loadingMessage, error }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShareMenuOpen, setShareMenuOpen] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  // Close the share menu if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isShareMenuOpen &&
        shareButtonRef.current &&
        !shareButtonRef.current.contains(event.target as Node) &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShareMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareMenuOpen]);


  const handleDownload = async () => {
    if (!comicPage) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      
      const fileExtension = comicPage.mimeType.split('/')[1] || 'png';
      zip.file(`comic-page.${fileExtension}`, comicPage.imageBase64, { base64: true });

      if (panelDescriptions.length > 0) {
        const captions = panelDescriptions.map(d => `Panel ${d.panel}: ${d.caption}`).join('\n\n');
        zip.file('story.txt', captions.trim());
      }


      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'storyframe-comic.zip';
      link.href = URL.createObjectURL(content);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Failed to download storyboard as ZIP:', err);
      alert('Sorry, there was an error creating the ZIP file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getShareInfo = () => {
    const shareText = "I just created a comic with StoryFrame! ✨ Check out this amazing AI comic generator.";
    const hashtags = "#StoryFrame #AIComic #GenerativeAI";
    const fullText = encodeURIComponent(`${shareText}\n\n${hashtags}`);
    const appUrl = encodeURIComponent(window.location.origin);
    return { fullText, appUrl };
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader message={loadingMessage} />;
    }

    if (error) {
      return (
        <div className="flex items-center justify-center text-center p-8 m-4 bg-red-900/50 border border-red-700 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      );
    }
    
    if (comicPage) {
      return (
        <div className="p-4 md:p-8 flex items-center justify-center">
          <img 
            src={comicPage.imageUrl} 
            alt="Generated comic page" 
            className="max-w-full h-auto rounded-lg shadow-2xl border-2 border-slate-700"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-400">Your comic page will appear here</h3>
            <p className="text-slate-500 mt-2">Just write a story, choose a style, and let the magic happen.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full">
        {comicPage && !isLoading && !error && (
            <div className="sticky top-0 z-10 p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-200">Your Comic Page</h3>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            ref={shareButtonRef}
                            onClick={() => setShareMenuOpen(prev => !prev)}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors duration-200 flex items-center gap-2"
                            aria-haspopup="true"
                            aria-expanded={isShareMenuOpen}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            Share
                        </button>
                        {isShareMenuOpen && (
                            <div
                                ref={shareMenuRef}
                                className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-xl z-20 origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-100 ease-out transform opacity-100 scale-100"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                <div className="py-1" role="none">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${getShareInfo().fullText}&url=${getShareInfo().appUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600"
                                        role="menuitem"
                                    >
                                        Share on X
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${getShareInfo().appUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600"
                                        role="menuitem"
                                    >
                                        Share on LinkedIn
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isDownloading ? 'Zipping...' : 'Download ZIP'}
                    </button>
                </div>
            </div>
        )}
        {renderContent()}
    </div>
  );
};

export default Storyboard;
