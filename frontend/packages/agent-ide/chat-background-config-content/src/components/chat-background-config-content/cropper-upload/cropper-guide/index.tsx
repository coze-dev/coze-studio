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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/coze-design';
import { FIRST_GUIDE_KEY_PREFIX } from '@coze-agent-ide/chat-background-shared';

interface CropperGuideProps {
  userId: string;
}
export const CropperGuide: React.FC<CropperGuideProps> = ({ userId }) => {
  const showGuide = !window.localStorage.getItem(
    `${FIRST_GUIDE_KEY_PREFIX}[${userId}]`,
  );

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [mouseIn, setMouseIn] = useState(false);
  const [draggable, setDraggable] = useState(false);

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    setPosition({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  };
  return (
    <>
      {mouseIn && showGuide ? (
        <Popover
          content={
            <>
              <div className="coz-fg-plus font-semi">
                {I18n.t('bgi_adjust_tooltip_title')}
              </div>
              <div className="coz-fg-dim text-xs">
                {I18n.t('bgi_adjust_tooltip_content')}
              </div>
            </>
          }
          visible
          rePosKey={position.x + position.y}
          showArrow
          position="top"
        >
          <div
            className="absolute w-4 h-4 z-[300]"
            style={{
              top: position.y,
              left: position.x,
            }}
          />
        </Popover>
      ) : null}

      {showGuide ? (
        <div
          className={'absolute w-full h-full z-[300] pointer-events-none'}
          onMouseEnter={() => {
            setMouseIn(true);
          }}
          onMouseLeave={() => {
            setMouseIn(false);
          }}
          onClick={() => {
            setDraggable(true);
            window.localStorage.setItem(
              `${FIRST_GUIDE_KEY_PREFIX}[${userId}]`,
              'true',
            );
          }}
          onMouseMove={handleMouseMove}
          style={{
            pointerEvents: draggable ? 'none' : 'auto',
          }}
        ></div>
      ) : null}
    </>
  );
};
