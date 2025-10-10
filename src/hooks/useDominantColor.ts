import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';

/**
 * Extract dominant color from an image URL
 * Returns RGB color that can be used for backgrounds
 */
export function useDominantColor(imageUrl: string | undefined) {
  const [color, setColor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }

    const fac = new FastAverageColor();
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      try {
        const avgColor = fac.getColor(img, { algorithm: 'dominant' });
        const [r, g, b] = avgColor.value;
        
        // Check if color is too dark (low brightness)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // If too dark (< 50), try to find a more vibrant color
        if (brightness < 50) {
          // Get multiple colors and find the most vibrant non-dark one
          const colors = fac.getColor(img, { algorithm: 'simple' });
          const [r2, g2, b2] = colors.value;
          const brightness2 = (r2 * 299 + g2 * 587 + b2 * 114) / 1000;
          
          // Use the lighter option, or boost the dark color
          if (brightness2 > 50) {
            setColor(`rgba(${r2}, ${g2}, ${b2}, 0.85)`);
          } else {
            // Boost the original color to make it more visible
            const boost = 2.5;
            setColor(`rgba(${Math.min(255, r * boost)}, ${Math.min(255, g * boost)}, ${Math.min(255, b * boost)}, 0.85)`);
          }
        } else {
          // Color is bright enough, use as is
          setColor(`rgba(${r}, ${g}, ${b}, 0.85)`);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error extracting color:', error);
        setColor(null);
        setIsLoading(false);
      }
    };

    img.onerror = () => {
      setColor(null);
      setIsLoading(false);
    };

    return () => {
      fac.destroy();
    };
  }, [imageUrl]);

  return { color, isLoading };
}


