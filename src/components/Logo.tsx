"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: number | string;
  showBackground?: boolean;
}

export default function Logo({ className = "", size = 24, showBackground = false }: LogoProps) {
  const sizeStyle = typeof size === "number" ? `${size}px` : size;

  const imgEl = (
    <img
      src="/logo.png"
      alt="Next Chapter Logo"
      className={showBackground ? "object-contain" : className}
      style={{
        width: showBackground ? "80%" : sizeStyle,
        height: showBackground ? "80%" : sizeStyle,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );

  if (showBackground) {
    return (
      <div
        className={`bg-linear-to-b from-slate-900 to-slate-950 flex items-center justify-center border border-white/5 shadow-inner ${className}`}
        style={{
          width: sizeStyle,
          height: sizeStyle,
        }}
      >
        {imgEl}
      </div>
    );
  }

  return imgEl;
}
