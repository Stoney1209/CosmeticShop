"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageZoomProps {
  src: string | null;
  alt: string;
}

export function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
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
        <span className="text-6xl text-slate-300" aria-hidden="true">✦</span>
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
      role="img"
      aria-label={`${alt}. Pasa el mouse para hacer zoom en la imagen.`}
    >
      {/* Default image - Optimized with next/image */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-200",
        isZoomed ? "opacity-0" : "opacity-100"
      )}>
        <Image 
          src={src} 
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" role="status" aria-label="Cargando imagen" />
          </div>
        )}
      </div>
      
      {/* Zoomed image layer - Using img for zoom effect (bg-size/position) but with preloading */}
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
        aria-hidden="true"
      />
      
      {/* Preload hint for zoom image - hidden but helps browser cache */}
      <link rel="preload" as="image" href={src} type="image/jpeg" fetchPriority="high" />
      
      {/* Zoom indicator */}
      <div 
        className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm"
        aria-hidden="true"
      >
        Pasa el mouse para hacer zoom
      </div>
    </div>
  );
}
