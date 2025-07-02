import React from 'react';

export interface FeedbackProps {
  className?: string;
  text?: string;
}

export function Feedback({ text, className }: FeedbackProps) {
  return text ? (
    <div className={`${className} text-[12px] leading-[16px] text-[#ff441e]`}>
      {text}
    </div>
  ) : null;
}
