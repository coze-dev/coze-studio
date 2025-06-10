import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze/coze-design';
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
