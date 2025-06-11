import React, { useState, type FC, type ReactNode } from 'react';

export interface ScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  /**
   * 浅色色码，用于顶端渐变的结束 & 底部渐变的开始
   */
  lightColor?: string;
  /**
   * 深色色码，用于顶端渐变的开始 & 底部渐变的结束
   */
  darkColor?: string;

  /**
   * 渐变区域的高度
   */
  linearHeight?: number;

  maxHeight?: number;

  /**
   * 渐变区域的遮罩
   */
  linearGradient?: boolean;
  scrollerYRef?: React.RefObject<HTMLDivElement>;
}

export const Scroll: FC<ScrollProps> = ({
  children,
  onScroll,
  lightColor = 'rgba(var(--coze-bg-2), 0)',
  darkColor = 'rgba(var(--coze-bg-2), 1)',
  linearHeight = 40,
  linearGradient = false,
  maxHeight,
  scrollerYRef,
  ...rest
}) => {
  const [scrollY, setScrollY] = useState(0);
  const linearGradientStyle = linearGradient
    ? `linear-gradient(180deg, ${lightColor} 0%, ${darkColor} 100%)`
    : 'inherit';

  return (
    <div
      className={['h-full', 'w-full', 'overflow-hidden', 'relative'].join(' ')}
      style={maxHeight ? { maxHeight } : {}}
      {...rest}
    >
      <div
        className={['h-full', 'w-full', 'overflow-y-auto'].join(' ')}
        style={maxHeight ? { maxHeight } : {}}
        onScroll={e => {
          const _scrollY = (e.target as HTMLElement)?.scrollTop;
          setScrollY(_scrollY);
          onScroll?.(e);
        }}
        ref={scrollerYRef}
      >
        {children}
      </div>
      {scrollY > 0 ? (
        <div
          className={[
            'absolute',
            'pointer-events-none',
            'top-0',
            'w-full',
          ].join(' ')}
          style={{
            height: `${linearHeight}px`,
            background: linearGradientStyle,
          }}
        />
      ) : (
        <></>
      )}
      <div
        className={[
          'absolute',
          'pointer-events-none',
          'bottom-0',
          'w-full',
        ].join(' ')}
        style={{
          height: `${linearHeight}px`,
          background: linearGradientStyle,
        }}
      />
    </div>
  );
};
