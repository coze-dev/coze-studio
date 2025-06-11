import React from 'react';

export const Semantic = ({
  text,
  color,
  className,
  textClassName,
}: {
  text: string;
  color: string;
  title: string;
  className?: string;
  textClassName?: string;
}) => (
  <div>
    <div
      className={`${className} flex flex-col items-center justify-center w-28 h-28 mx-2 my-3 rounded-xl shadow-lg`}
    />
    <div
      className={`${textClassName} text-sm flex flex-col items-center justify-center w-auto mb-1 text-[12px]`}
    >
      {text}
    </div>
    <div className="text-sm flex flex-col items-center justify-center w-auto text-[11px] text-gray-400">
      {color && <span>({color})</span>}
    </div>
  </div>
);
