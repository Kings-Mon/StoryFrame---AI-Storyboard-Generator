
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-[pulsate_1.5s_infinite_ease-in-out]"></div>
        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-[pulsate_1.5s_infinite_ease-in-out_0.25s]"></div>
        <div className="w-4 h-4 bg-cyan-400 rounded-full animate-[pulsate_1.5s_infinite_ease-in-out_0.5s]"></div>
      </div>
      <style>{`
        @keyframes pulsate {
          0%, 100% { transform: scale(0.8); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      <p className="mt-6 text-lg text-slate-300 font-medium tracking-wide">{message}</p>
    </div>
  );
};

export default Loader;