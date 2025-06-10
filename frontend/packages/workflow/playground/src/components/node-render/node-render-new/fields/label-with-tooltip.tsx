import { useEffect, useRef, useState } from 'react';

import { Tooltip } from '@coze/coze-design';

export const LabelWithTooltip = ({ customClassName, maxWidth, content }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current?.offsetWidth;
      setIsOverflowing(textWidth >= maxWidth);
    }
  }, [content, maxWidth]); // 依赖于文本内容，当文本内容变化时重新检查

  return (
    <Tooltip
      content={<span className="coz-fg-primary text-lg">{content ?? ''}</span>}
      style={{
        backgroundColor: 'rgba(var(--coze-bg-3), 1)',
        display: isOverflowing ? 'block' : 'none',
      }}
    >
      <div
        className={
          'overflow-hidden text-ellipsis whitespace-nowrap leading-[20px]'
        }
        style={{
          maxWidth: isOverflowing ? `${maxWidth}px` : 'auto',
        }}
      >
        <span ref={textRef} className={customClassName}>
          {content ?? ''}
        </span>
      </div>
    </Tooltip>
  );
};
