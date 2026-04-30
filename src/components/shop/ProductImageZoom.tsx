"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ProductImageZoomProps {
  src: string | null;
  alt: string;
}

export function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setMousePosition({ x: 50, y: 50 });
  };

  if (!src) {
    return (
      <div className="aspect-[4/5] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
        <span className="text-6xl text-slate-300">✦</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="aspect-[4/5] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden cursor-zoom-in relative group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Default image */}
      <img 
        src={src} 
        alt={alt} 
        className={cn(
          "w-full h-full object-cover transition-transform duration-200",
          isZoomed ? "opacity-0" : "opacity-100"
        )}
      />
      
      {/* Zoomed image */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-200",
          isZoomed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
          backgroundSize: "200%",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Pasa el mouse para hacer zoom
      </div>
    </div>
  );
}
