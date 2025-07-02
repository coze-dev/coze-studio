import React, { useEffect, useRef, useState } from 'react';

import { EventKey } from '../use-custom-event';
import {
  type ConfigType,
  type CommonRenderProps,
  type ResourceType,
} from '../../type';

export const useDragUI = ({
  iconRender,
  selectedMap,
  addEventListener,
  config,
}: {
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  selectedMap: Record<string, ResourceType>;
  addEventListener: (key: EventKey, fn: (e) => void) => void;
  config?: ConfigType;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleDrag = (v: boolean) => {
    isDraggingRef.current = v;
    setIsDragging(v);

    setMousePosition(null);
    if (v) {
      document.body.style.cursor = 'grabbing';
    } else {
      document.body.style.cursor = '';
    }
  };

  const handleMouseMove = e => {
    if (isDraggingRef.current) {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  useEffect(() => {
    addEventListener(EventKey.MouseMove, handleMouseMove);
  }, []);

  const dragPreview =
    mousePosition && !config?.dragUi?.disable ? (
      <div
        style={{
          position: 'absolute',
          zIndex: 99999,
          top: 5,
          left: 5,
          display: isDragging && mousePosition?.x ? 'block' : 'none',
          transform: `translate(${mousePosition?.x || 0}px, ${
            mousePosition?.y || 0
          }px)`,
          userSelect: 'none',
          pointerEvents: 'none',
          backgroundColor: 'rgba(6, 7, 9, 0.08)',
          borderRadius: 6,
          padding: '2px 4px',
          minWidth: 20,
          minHeight: 20,
          ...(config?.dragUi?.wrapperStyle || {}),
        }}
        className={config?.dragUi?.wrapperClassName || ''}
      >
        {Object.values(selectedMap).length > 1 ? (
          <>{Object.values(selectedMap).length}</>
        ) : (
          Object.values(selectedMap).map(item => (
            <div
              key={item.name}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {item?.type ? (
                <span style={{ marginRight: 4 }}>
                  {iconRender?.({
                    resource: item,
                  })}
                </span>
              ) : (
                <></>
              )}
              <span>{item.name}</span>
            </div>
          ))
        )}
      </div>
    ) : (
      <></>
    );

  return { handleDrag, isDragging, isDraggingRef, dragPreview };
};
