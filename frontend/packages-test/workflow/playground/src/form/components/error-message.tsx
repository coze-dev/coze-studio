import React from 'react';

export interface ErrorMessageProps {
  className?: string;
  text?: string;
}

export function ErrorMessage({ text, className }: ErrorMessageProps) {
  return (
    <div className={`${className} text-[12px] leading-[16px] text-[#ff441e]`}>
      {text}
    </div>
  );
}
