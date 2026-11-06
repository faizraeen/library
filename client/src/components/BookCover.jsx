import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

const BookCover = ({
  src,
  title,
  author,
  category,
  className = 'w-full h-56',
  fallbackSize = 'text-xs',
}) => {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Dynamic palette based on category
  const getCategoryTheme = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('blockchain') || c.includes('security')) {
      return 'from-[#0B2E1B] via-[#14532D] to-[#1E3A8A]';
    }
    if (c.includes('ai') || c.includes('machine') || c.includes('data')) {
      return 'from-[#064E3B] via-[#047857] to-[#0F766E]';
    }
    if (c.includes('web') || c.includes('programming') || c.includes('computer')) {
      return 'from-[#14532D] via-[#15803D] to-[#166534]';
    }
    return 'from-[#0F2D1F] via-[#164E33] to-[#14532D]';
  };

  if (!src || imageError) {
    return (
      <div
        className={`${className} relative rounded-lg bg-gradient-to-br ${getCategoryTheme(
          category
        )} p-4 flex flex-col justify-between text-white shadow-md border border-forest-900/40 select-none overflow-hidden group`}
      >
        {/* Subtle book spine styling */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/25 border-r border-white/10" />

        {/* Decorative corner pattern */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="pl-2">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase bg-white/15 text-white/90 backdrop-blur-sm">
            {category || 'Library Book'}
          </span>
        </div>

        <div className="pl-2 my-auto">
          <h4 className="font-semibold text-sm leading-snug line-clamp-3 text-white drop-shadow-sm">
            {title}
          </h4>
          <p className="text-xs text-white/75 mt-1 line-clamp-1">
            {author}
          </p>
        </div>

        <div className="pl-2 flex items-center justify-between text-[10px] text-white/60 border-t border-white/10 pt-2">
          <span>LibraChain</span>
          <BookOpen className="w-3.5 h-3.5 text-white/70" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden bg-gray-100 shadow-sm border border-gray-200/80`}>
      <img
        src={src}
        alt={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setImageError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <BookOpen className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default BookCover;
