import { useState, useEffect } from 'react';

const useImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      setImage(img);
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [src]);

  return { isLoaded, hasError, image };
};

export default useImage;
