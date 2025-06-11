import { useDragLayer } from 'react-dnd';
import { useMemo, useRef } from 'react';

import {
  IconCozCheckMarkCircleFillPalette,
  IconCozInfoCircleFillPalette,
} from '@coze/coze-design/icons';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowCustomDragService } from '../../services';
import { useGlobalState } from '../../hooks';
import { DND_ACCEPT_KEY } from '../../constants';

import styles from './index.module.less';

export const DragTooltip = () => {
  const dragService = useService<WorkflowCustomDragService>(
    WorkflowCustomDragService,
  );
  const globalState = useGlobalState();
  const { item, itemType, currentOffset, allowDrop, message } = useDragLayer(
    monitor => {
      const canDrop = dragService.computeCanDrop({
        coord: currentOffset ?? { x: 0, y: 0 },
        dragNode: {
          type: item?.nodeType,
          json: item?.nodeJson,
        },
      });

      return {
        allowDrop: canDrop.allowDrop,
        message: canDrop.message,
        item: monitor.getItem(),
        itemType: monitor.getItemType() as string,
        currentOffset: monitor.getSourceClientOffset() ?? { x: 0, y: 0 },
      };
    },
  );

  const display = useMemo(() => {
    if (itemType !== DND_ACCEPT_KEY) {
      return false;
    }
    if (!message) {
      // 仅在有消息时展示
      return false;
    }
    return true;
  }, [itemType, message]);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const offset = useMemo(() => {
    const isInProject = Boolean(globalState.projectId);
    // 初始位置为画布左上角，currentOffset 为距离屏幕左上角的偏移，需要减去画布距离屏幕左上角偏移
    const playgroundOffsetX = isInProject ? 276 : 0;
    const playgroundOffsetY = isInProject ? 100 : 73;

    const nodeCardWidth = 204;
    const tooltipArrowHeight = 10;
    const left =
      currentOffset.x -
      playgroundOffsetX -
      ((tooltipRef.current?.clientWidth ?? 0) - nodeCardWidth) / 2;
    const top =
      currentOffset.y -
      playgroundOffsetY -
      (tooltipRef.current?.clientHeight ?? 0) -
      tooltipArrowHeight;
    return { left, top };
  }, [currentOffset, globalState.projectId]);
  return (
    <div
      className={styles['drag-tooltip-container']}
      ref={tooltipRef}
      style={{
        display: display ? 'block' : 'none',
        ...offset,
      }}
    >
      <div className={styles['drag-tooltip-main']}>
        <div className={styles['drag-tooltip-icon']}>
          {allowDrop ? (
            <IconCozCheckMarkCircleFillPalette
              className={styles['success-icon']}
            />
          ) : (
            <IconCozInfoCircleFillPalette className={styles['warning-icon']} />
          )}
        </div>
        <div className={styles['drag-tooltip-content']}>{message}</div>
      </div>
      <svg
        className={styles['drag-tooltip-arrow']}
        width="24"
        height="8"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z"
          fill="var(--semi-color-border)"
          opacity="1"
        ></path>
        <path
          d="M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z"
          fill="var(--semi-color-bg-3)"
        ></path>
      </svg>
    </div>
  );
};
