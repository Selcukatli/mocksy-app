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
        // Return RGBA with good opacity for overlays
        setColor(`rgba(${avgColor.value[0]}, ${avgColor.value[1]}, ${avgColor.value[2]}, 0.85)`);
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


