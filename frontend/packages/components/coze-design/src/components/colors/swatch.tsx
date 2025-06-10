import React from 'react';

export const Swatch = ({ color, title }: { color: string; title: string }) => {
  const colorText = color ? title.toLowerCase() : 'N/A';
  return (
    <div>
      <div
        className="flex flex-col items-center justify-center w-32 h-32 m-2 rounded-xl shadow-lg"
        style={{
          backgroundColor: color,
        }}
      ></div>
      <div className="flex flex-col items-center justify-center w-auto mb-1 text-gray-600 text-[13px]">
        {colorText}
      </div>
      <div className="flex flex-col items-center justify-center w-auto text-gray-400 text-[12px]">
        {color}
      </div>
    </div>
  );
};
