"use client";

import React, { useState } from "react";
import { Book } from "lucide-react";

interface BookCoverProps {
  title: string;
  author: string;
  coverUrl?: string;
  className?: string;
}

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-[#0a84ff]/90 to-slate-900",
  "from-cyan-600 to-slate-900",
  "from-sky-600 to-slate-900",
  "from-[#0a84ff] to-[#004080]",
  "from-[#64d2ff] to-[#005a80]"
];

export default function BookCover({ title, author, coverUrl, className = "" }: BookCoverProps) {
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
      <div className={`relative overflow-hidden bg-slate-900 w-full h-full ${className}`}>
        <img
          src={coverUrl}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Placeholder cover card
  const gradient = getGradient(title);
  const initials = getInitials(title);

  return (
    <div 
      className={`relative w-full h-full bg-linear-to-br ${gradient} flex flex-col justify-between p-4 text-white font-sans overflow-hidden select-none ${className}`}
    >
      {/* Decorative background overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
      
      {/* Top Header info */}
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">ARC</span>
        <Book className="w-4 h-4 text-white/50" />
      </div>

      {/* Initials center circle */}
      <div className="flex-1 flex items-center justify-center z-10 my-2">
        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl font-bold tracking-tight">
          {initials}
        </div>
      </div>

      {/* Title & Author overlay */}
      <div className="z-10 mt-auto">
        <h3 className="text-sm font-bold tracking-tight leading-tight line-clamp-2 text-white/95" title={title}>
          {title}
        </h3>
        <p className="text-[10px] text-white/70 font-medium truncate mt-0.5" title={author}>
          by {author}
        </p>
      </div>
    </div>
  );
}
