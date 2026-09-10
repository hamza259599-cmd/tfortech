import { useMemo } from "react";

/**
 * StylishText Component - Renders text with random playful styling
 * Each letter can have different size, color, rotation for a fun effect
 */
export default function StylishText({ 
  text, 
  enabled = true,
  intensity = "medium", // low, medium, high
  colors = ["#3B82F6", "#FFD166", "#4ECDC4", "#9B59B6", "#06D6A0"],
  className = ""
}) {
  
  const styledLetters = useMemo(() => {
    if (!text || !enabled) return null;
    
    // Intensity settings
    const settings = {
      low: { sizeRange: [0.95, 1.05], rotateRange: [-3, 3], colorChance: 0.2 },
      medium: { sizeRange: [0.9, 1.15], rotateRange: [-5, 5], colorChance: 0.35 },
      high: { sizeRange: [0.85, 1.25], rotateRange: [-8, 8], colorChance: 0.5 }
    };
    
    const { sizeRange, rotateRange, colorChance } = settings[intensity] || settings.medium;
    
    return text.split('').map((letter, index) => {
      // Skip spaces
      if (letter === ' ') {
        return <span key={index}>&nbsp;</span>;
      }
      
      // Random values
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      const rotate = rotateRange[0] + Math.random() * (rotateRange[1] - rotateRange[0]);
      const shouldColor = Math.random() < colorChance;
      const color = shouldColor ? colors[Math.floor(Math.random() * colors.length)] : 'inherit';
      const shouldBold = Math.random() < 0.3;
      const translateY = (Math.random() - 0.5) * 4;
      
      return (
        <span
          key={index}
          style={{
            display: 'inline-block',
            transform: `rotate(${rotate}deg) translateY(${translateY}px) scale(${size})`,
            color: color,
            fontWeight: shouldBold ? 'bold' : 'inherit',
            transition: 'transform 0.3s ease',
          }}
          className="hover:scale-110"
        >
          {letter}
        </span>
      );
    });
  }, [text, enabled, intensity, colors]);
  
  if (!enabled) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {styledLetters}
    </span>
  );
}

/**
 * Preset styles for common use cases
 */
export const StylishPresets = {
  playful: {
    intensity: "high",
    colors: ["#3B82F6", "#FFD166", "#4ECDC4", "#9B59B6", "#06D6A0"]
  },
  subtle: {
    intensity: "low", 
    colors: ["#3B82F6", "#4ECDC4"]
  },
  rainbow: {
    intensity: "medium",
    colors: ["#FF6B6B", "#FFA500", "#FFD700", "#4ECDC4", "#45B7D1", "#9B59B6", "#FF69B4"]
  },
  monochrome: {
    intensity: "medium",
    colors: ["#1A1A1A", "#4A4A4A", "#6B7280"]
  }
};
