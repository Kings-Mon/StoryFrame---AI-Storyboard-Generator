
import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center p-4 md:p-3">
      <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
        StoryFrame
      </h1>
      <p className="text-slate-200 mt-2 text-lg">
        Bring your stories to life...
      </p>
    </div>
  );
};

export default Header;