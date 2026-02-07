
import React from 'react';

interface BodyGraphProps {
  centers: Record<string, boolean>;
  channels: string[];
  activeGates?: Record<string, boolean>;
  className?: string;
}

export const BodyGraph: React.FC<BodyGraphProps> = ({ centers, channels, className }) => {
  const isDefined = (centerName: string) => centers[centerName];
  const getColor = (centerName: string) => isDefined(centerName) ? "#E2E2E8" : "#1E1F20"; // Platinum vs Dark Gray
  const getStroke = (centerName: string) => isDefined(centerName) ? "#E2E2E8" : "#333";

  // Coordinates (approximate for standard HD layout)
  const coords = {
    Head: { x: 50, y: 10 },
    Ajna: { x: 50, y: 25 },
    Throat: { x: 50, y: 40 },
    G: { x: 50, y: 55 },
    Heart: { x: 75, y: 55 },
    Sacral: { x: 50, y: 70 },
    Spleen: { x: 20, y: 70 },
    SolarPlexus: { x: 80, y: 70 },
    Root: { x: 50, y: 90 }
  };

  return (
    <svg viewBox="0 0 100 100" className={`w-full h-auto drop-shadow-2xl ${className}`}>
      {/* DEFINITIONS FILTER */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* CONNECTIONS (Abstracted) */}
      <line x1={coords.Head.x} y1={coords.Head.y} x2={coords.Ajna.x} y2={coords.Ajna.y} stroke="#333" strokeWidth="1" />
      <line x1={coords.Ajna.x} y1={coords.Ajna.y} x2={coords.Throat.x} y2={coords.Throat.y} stroke="#333" strokeWidth="1" />
      <line x1={coords.Throat.x} y1={coords.Throat.y} x2={coords.G.x} y2={coords.G.y} stroke="#333" strokeWidth="1" />
      <line x1={coords.G.x} y1={coords.G.y} x2={coords.Sacral.x} y2={coords.Sacral.y} stroke="#333" strokeWidth="1" />
      <line x1={coords.Sacral.x} y1={coords.Sacral.y} x2={coords.Root.x} y2={coords.Root.y} stroke="#333" strokeWidth="1" />
      
      {/* CENTERS */}
      
      {/* Head (Triangle Up) */}
      <path 
        d="M50 5 L60 20 H40 Z" 
        fill={getColor("Head")} 
        stroke={getStroke("Head")}
        strokeWidth="0.5"
        filter={isDefined("Head") ? "url(#glow)" : ""}
      />

      {/* Ajna (Triangle Down) */}
      <path 
        d="M40 22 H60 L50 37 Z" 
        fill={getColor("Ajna")} 
        stroke={getStroke("Ajna")}
        strokeWidth="0.5"
        filter={isDefined("Ajna") ? "url(#glow)" : ""}
      />

      {/* Throat (Square) */}
      <rect 
        x="42" y="38" width="16" height="12" 
        fill={getColor("Throat")} 
        stroke={getStroke("Throat")}
        strokeWidth="0.5"
        filter={isDefined("Throat") ? "url(#glow)" : ""}
      />

      {/* G Center (Diamond) */}
      <path 
        d="M50 50 L60 60 L50 70 L40 60 Z" 
        transform="translate(0 -5) scale(0.8) translate(12 12)"
        fill={getColor("G")} 
        stroke={getStroke("G")}
        strokeWidth="0.5"
        filter={isDefined("G") ? "url(#glow)" : ""}
      />

      {/* Heart (Small Triangle) */}
      <path 
        d="M72 52 L82 52 L77 62 Z" 
        fill={getColor("Heart")} 
        stroke={getStroke("Heart")}
        strokeWidth="0.5"
        filter={isDefined("Heart") ? "url(#glow)" : ""}
      />

      {/* Sacral (Square) */}
      <rect 
        x="42" y="65" width="16" height="16" 
        fill={getColor("Sacral")} 
        stroke={getStroke("Sacral")}
        strokeWidth="0.5"
        filter={isDefined("Sacral") ? "url(#glow)" : ""}
      />

      {/* Spleen (Triangle Left) */}
      <path 
        d="M10 65 H30 L10 85 Z" 
        fill={getColor("Spleen")} 
        stroke={getStroke("Spleen")}
        strokeWidth="0.5"
        filter={isDefined("Spleen") ? "url(#glow)" : ""}
      />

      {/* Solar Plexus (Triangle Right) */}
      <path 
        d="M70 65 H90 L90 85 Z" 
        fill={getColor("SolarPlexus")} 
        stroke={getStroke("SolarPlexus")}
        strokeWidth="0.5"
        filter={isDefined("SolarPlexus") ? "url(#glow)" : ""}
      />

      {/* Root (Square) */}
      <rect 
        x="42" y="86" width="16" height="16" 
        fill={getColor("Root")} 
        stroke={getStroke("Root")}
        strokeWidth="0.5"
        filter={isDefined("Root") ? "url(#glow)" : ""}
      />
    </svg>
  );
};
