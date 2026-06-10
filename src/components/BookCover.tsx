"use client";

import React, { useState } from "react";
import { Book } from "lucide-react";

interface BookCoverProps {
  title: string;
  author: string;
  coverUrl?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const GRADIENTS = [
  "from-[#1e1e2f] to-[#0f0f1a]", // Midnight obsidian
  "from-[#1a365d] to-[#0a192f]", // Deep ocean blue
  "from-[#2d124d] to-[#120524]", // Royal purple
  "from-[#1c3d27] to-[#0a1c10]", // Emerald forest
  "from-[#4c1d1d] to-[#1f0707]", // Crimson wine
  "from-[#3b2314] to-[#1c0f07]", // Terracotta / warm clay
  "from-[#104b57] to-[#052126]"  // Teal peacock
];

export default function BookCover({ title, author, coverUrl, className = "", size = "md" }: BookCoverProps) {
  const [prevCoverUrl, setPrevCoverUrl] = useState(coverUrl);
  const [hasError, setHasError] = useState(false);

  if (coverUrl !== prevCoverUrl) {
    setPrevCoverUrl(coverUrl);
    setHasError(false);
  }

  // Hash title to pick a stable gradient
  const getGradient = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
  };

  // Get title initials
  const getInitials = (str: string) => {
    if (!str) return "B";
    const words = str.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return str.charAt(0).toUpperCase();
  };

  if (coverUrl && !hasError) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 w-full h-full group/cover ${className}`}>
        <img
          src={coverUrl}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          onError={() => setHasError(true)}
        />
        {/* Subtle 3D spine crease overlay even for images */}
        <div className="absolute left-0 top-0 w-[6%] h-full bg-gradient-to-r from-black/30 via-white/5 to-transparent pointer-events-none z-20 border-r border-black/10"></div>
      </div>
    );
  }

  const gradient = getGradient(title);
  const initials = getInitials(title);

  // Render based on size variant
  if (size === "xs") {
    // Kanban board cover (36x48px)
    return (
      <div 
        className={`relative w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center text-white overflow-hidden select-none ${className}`}
      >
        {/* 3D Book spine shadow */}
        <div className="absolute left-0 top-0 w-[15%] h-full bg-gradient-to-r from-black/40 via-white/5 to-transparent pointer-events-none z-20"></div>
        {/* Monogram initials */}
        <span className="font-serif font-bold text-[10px] tracking-wider text-white/80 z-10">
          {initials}
        </span>
      </div>
    );
  }

  if (size === "sm") {
    // Dashboard list mini cover (48x64px)
    return (
      <div 
        className={`relative w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center text-white overflow-hidden select-none ${className}`}
      >
        {/* 3D Book spine shadow */}
        <div className="absolute left-0 top-0 w-[12%] h-full bg-gradient-to-r from-black/35 via-white/5 to-transparent pointer-events-none z-20"></div>
        {/* Monogram initials */}
        <span className="font-serif font-bold text-xs tracking-wider text-white/85 z-10">
          {initials}
        </span>
      </div>
    );
  }

  if (size === "md") {
    // Library card cover (96x144px)
    return (
      <div 
        className={`relative w-full h-full bg-linear-to-br ${gradient} flex flex-col justify-between p-2.5 text-white overflow-hidden select-none ${className}`}
      >
        {/* 3D Book spine shadow */}
        <div className="absolute left-0 top-0 w-[8%] h-full bg-gradient-to-r from-black/30 via-white/5 to-transparent pointer-events-none z-20 border-r border-black/5"></div>
        
        {/* Top minimal book detail */}
        <div className="flex justify-between items-center z-10 opacity-60">
          <span className="text-[7px] font-bold tracking-widest uppercase font-sans">ARC</span>
          <Book className="w-2.5 h-2.5" />
        </div>

        {/* Center monogram initials (clean, no heavy circle) */}
        <div className="flex-1 flex items-center justify-center z-10">
          <span className="font-serif font-extrabold text-lg tracking-wider text-white/90">
            {initials}
          </span>
        </div>

        {/* Bottom Title & Author (Minimalist & elegant) */}
        <div className="z-10 mt-auto text-center border-t border-white/10 pt-1.5 pb-0.5">
          <h3 className="text-[9px] font-sans font-bold leading-tight line-clamp-2 text-white/95" title={title}>
            {title}
          </h3>
          <p className="text-[7.5px] text-white/60 truncate mt-0.5" title={author}>
            {author}
          </p>
        </div>
      </div>
    );
  }

  // Large Cover (Form preview / Detail page)
  return (
    <div 
      className={`relative w-full h-full bg-linear-to-br ${gradient} flex flex-col justify-between p-6 text-white overflow-hidden select-none ${className}`}
    >
      {/* 3D Book spine shadow */}
      <div className="absolute left-0 top-0 w-[6%] h-full bg-gradient-to-r from-black/30 via-white/5 to-transparent pointer-events-none z-20 border-r border-black/5"></div>
      
      {/* Top Header info */}
      <div className="flex justify-between items-center z-10 px-1 pt-1">
        <span className="text-[9px] font-extrabold tracking-widest uppercase text-white/60 font-sans">
          Advance Reader Copy
        </span>
        <Book className="w-4 h-4 text-white/40" />
      </div>

      {/* Initials center monogram with elegant design */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 my-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.03] backdrop-blur-xs border border-white/15 flex items-center justify-center shadow-inner">
          <span className="font-serif font-extrabold text-2xl tracking-widest text-white/90">
            {initials}
          </span>
        </div>
      </div>

      {/* Title & Author overlay */}
      <div className="z-10 mt-auto text-center px-2 pb-2">
        <h3 className="text-sm font-serif font-extrabold tracking-wide leading-snug line-clamp-3 text-white/95" title={title}>
          {title}
        </h3>
        <div className="w-8 h-px bg-white/20 mx-auto my-2"></div>
        <p className="text-[10px] text-white/70 font-medium tracking-wide uppercase" title={author}>
          {author}
        </p>
      </div>
    </div>
  );
}
