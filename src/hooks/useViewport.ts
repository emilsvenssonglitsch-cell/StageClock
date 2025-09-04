import { useState, useEffect } from 'react';

export interface ViewportDimensions {
  width: number;
  height: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  aspectRatio: number;
}

export function useViewport(): ViewportDimensions {
  const [dimensions, setDimensions] = useState<ViewportDimensions>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    return {
      width,
      height,
      isSmall: width < 640,
      isMedium: width >= 640 && width < 1024,
      isLarge: width >= 1024 && width < 1280,
      isXLarge: width >= 1280,
      aspectRatio,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      setDimensions({
        width,
        height,
        isSmall: width < 640,
        isMedium: width >= 640 && width < 1024,
        isLarge: width >= 1024 && width < 1280,
        isXLarge: width >= 1280,
        aspectRatio,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
}