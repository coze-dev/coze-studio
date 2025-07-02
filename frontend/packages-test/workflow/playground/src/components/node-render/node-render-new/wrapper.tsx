import { type PropsWithChildren, useCallback, useState } from 'react';

import { ConfigProvider } from '@coze-arch/bot-semi';
import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

interface WrapperProps {
  className?: string;
  onClick?: (e) => void;
}

export function Wrapper({
  children,
  className = '',
  onClick,
}: PropsWithChildren<WrapperProps>) {
  const [isDragging, setIsDragging] = useState(false);
  const { startDrag, nodeRef, onFocus, onBlur } = useNodeRender();

  const handleClick = e => {
    if (!isDragging) {
      onClick?.(e);
    }
  };

  const handleDragStart = e => {
    setIsDragging(true);
    startDrag(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getPopupContainer = useCallback(
    () => nodeRef.current || document.body,
    [nodeRef],
  );

  return (
    <ConfigProvider getPopupContainer={getPopupContainer}>
      <div
        className={className}
        onClick={handleClick}
        ref={nodeRef}
        onFocus={onFocus}
        onBlur={onBlur}
        onDragStart={handleDragStart}
        onMouseUp={handleMouseUp}
        draggable
      >
        {children}
      </div>
    </ConfigProvider>
  );
}
