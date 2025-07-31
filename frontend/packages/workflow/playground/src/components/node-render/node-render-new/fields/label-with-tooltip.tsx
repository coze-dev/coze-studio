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

import { useEffect, useRef, useState } from 'react';

import { Tooltip } from '@coze-arch/coze-design';

export const LabelWithTooltip = ({ customClassName, maxWidth, content }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const textWidth = textRef.current?.offsetWidth;
      setIsOverflowing(textWidth >= maxWidth);
    }
  }, [content, maxWidth]); // Depends on the text content, rechecking when the text content changes

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
