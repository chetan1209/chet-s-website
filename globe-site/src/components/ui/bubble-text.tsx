import React, { useState } from "react";

interface BubbleTextProps {
  text: string;
  className?: string;
  hoveredClassName?: string;
  neighborClassName?: string;
  baseColor?: string;
  hoveredColor?: string;
  neighborColor?: string;
  style?: React.CSSProperties;
}

export const BubbleText = ({
  text,
  className = "",
  hoveredClassName = "font-black",
  neighborClassName = "font-medium",
  baseColor = "",
  hoveredColor = "",
  neighborColor = "",
  style,
}: BubbleTextProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <span
      // Reset the hovered index when the mouse leaves the entire text container.
      onMouseLeave={() => setHoveredIndex(null)}
      className={`inline-block ${className} ${baseColor}`}
      style={style}
    >
      {text.split("").map((char, idx) => {
        // Calculate the distance from the currently hovered character.
        // This will be 0 for the hovered character, 1 for its immediate neighbors, etc.
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;
        
        // Base classes for all characters, including the transition effect.
        let classes = "transition-all duration-300 ease-in-out cursor-default inline-block";
        let transformStyle: React.CSSProperties = {
          display: 'inline-block',
        };
        
        // Apply different styles based on the distance from the hovered character.
        if (distance === null) {
          // No hover - base state
          transformStyle = { 
            ...transformStyle,
            transform: 'scale(1)',
          };
        } else {
          switch (distance) {
            case 0: // The character being hovered over.
              classes += ` ${hoveredClassName} ${hoveredColor}`;
              // Make hovered character larger and bolder
              transformStyle = { 
                ...transformStyle,
                transform: 'scale(1.25)',
                fontWeight: 900,
                filter: 'brightness(1.3) drop-shadow(0 0 8px currentColor)',
              };
              break;
            case 1: // Immediate neighbors.
              classes += ` ${neighborClassName} ${neighborColor}`;
              transformStyle = { 
                ...transformStyle,
                transform: 'scale(1.1)',
                fontWeight: 800,
              };
              break;
            case 2: // Second-degree neighbors.
              classes += " font-light";
              transformStyle = { 
                ...transformStyle,
                transform: 'scale(0.92)',
                fontWeight: 500,
                opacity: 0.8
              };
              break;
            default:
              // Characters further away - reduce weight and size
              transformStyle = { 
                ...transformStyle,
                transform: 'scale(0.96)',
                fontWeight: 600,
                opacity: 0.85
              };
              break;
          }
        }

        return (
          <span
            key={idx}
            // Update the state with the index of the character being hovered.
            onMouseEnter={() => setHoveredIndex(idx)}
            className={classes}
            style={transformStyle}
          >
            {/* Use a non-breaking space for space characters to prevent collapsing */}
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
};
