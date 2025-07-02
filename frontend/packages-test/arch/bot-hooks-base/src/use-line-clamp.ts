import { useState, useEffect, useRef } from 'react';

export function useLineClamp() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const checkClamped = () => {
      if (contentRef.current) {
        setIsClamped(
          contentRef.current.scrollHeight > contentRef.current.clientHeight,
        );
      }
    };

    checkClamped();
    window.addEventListener('resize', checkClamped);

    return () => {
      window.removeEventListener('resize', checkClamped);
    };
  }, []);

  return { contentRef, isClamped };
}
