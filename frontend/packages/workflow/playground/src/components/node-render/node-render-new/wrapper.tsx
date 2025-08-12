/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
