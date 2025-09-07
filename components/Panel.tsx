import React from 'react';
import type { Panel as PanelType } from '../types';

interface PanelProps {
  panel: PanelType;
  index: number;
  onRegenerate: (index: number) => void;
  isRegenerating: boolean;
}

const Panel: React.FC<PanelProps> = ({ panel, index, onRegenerate, isRegenerating }) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent handlers from firing
    if (!panel.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = panel.imageUrl;
    const fileExtension = panel.mimeType?.split('/')[1] || 'png';
    link.download = `panel_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-cyan-500/10">
      <div className="relative aspect-square bg-slate-900">
        {isRegenerating && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-sm text-slate-300">Regenerating...</p>
          </div>
        )}
        <img 
          src={panel.imageUrl} 
          // Fix: Use `visual_description` for alt text, which is more descriptive for accessibility.
          alt={`Panel ${index + 1}: ${panel.visual_description}`} 
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 bg-slate-900 bg-opacity-70 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center text-sm border-2 border-slate-700 select-none">
          {index + 1}
        </div>
        
        <button
          onClick={() => onRegenerate(index)}
          disabled={isRegenerating}
          className="absolute top-2 right-12 p-2 bg-slate-900/60 backdrop-blur-sm text-slate-300 hover:bg-cyan-600 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 focus:opacity-100 focus:scale-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Regenerate Panel ${index + 1}`}
          title={`Regenerate Panel ${index + 1}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={handleDownload}
          disabled={isRegenerating}
          className="absolute top-2 right-2 p-2 bg-slate-900/60 backdrop-blur-sm text-slate-300 hover:bg-cyan-600 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 focus:opacity-100 focus:scale-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          aria-label={`Download Panel ${index + 1}`}
          title={`Download Panel ${index + 1}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

      </div>
      <div className="p-4 flex-grow bg-slate-800/50">
        {/* Fix: Use `caption` to display the panel's dialogue or narrative text. */}
        <p className="text-slate-300 text-sm leading-relaxed">{panel.caption}</p>
      </div>
    </div>
  );
};

export default Panel;
