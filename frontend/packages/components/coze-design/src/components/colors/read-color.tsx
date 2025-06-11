import React, { useRef, useState, useEffect } from 'react';

export const ReadColor = ({ text }: { text: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [realColor, setRealColor] = useState<string>('');

  useEffect(() => {
    if (ref.current) {
      const color = window.getComputedStyle(ref.current).backgroundColor;
      setRealColor(color);
    }
  }, [text]);

  return (
    <div>
      <div
        ref={ref}
        style={{ background: `var(--${text})`, visibility: 'hidden' }}
      ></div>
      <div className="font-small text-base leading-6 text-gray-500">
        {realColor}
      </div>
    </div>
  );
};
