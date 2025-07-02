import { useMemo, type FC } from 'react';

import { useNodeRender } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { useNodeTestId } from '@coze-workflow/base';
import { IconInfo } from '@coze-arch/bot-icons';

import AutoSizeTooltip from '@/ui-components/auto-size-tooltip';
import { getBgColor } from '@/form-extensions/components/node-header/utils/get-bg-color';

import { useParentNode, useSubCanvasRenderProps } from '../../hooks';
import { NodeIcon } from '../../../node-icon';

import styles from './index.module.less';

export const SubCanvasHeader: FC = () => {
  const { startDrag, onFocus, onBlur } = useNodeRender();
  const { getNodeTestId, concatTestId } = useNodeTestId();

  const { title, tooltip } = useSubCanvasRenderProps();

  const parentNode = useParentNode();

  const bgColor = useMemo(() => {
    const parentNodeDataEntity =
      parentNode.getData<WorkflowNodeData>(WorkflowNodeData);
    const parentNodeData = parentNodeDataEntity.getNodeData();
    if (parentNodeData?.mainColor) {
      const OPACITY = 0.08;
      return `linear-gradient(${getBgColor(
        parentNodeData.mainColor,
        OPACITY,
      )} 0%, var(--coz-bg-plus) 100%)`;
    } else {
      return 'var(--coz-bg-plus)';
    }
  }, [parentNode]);

  return (
    <div
      className={styles['sub-canvas-header']}
      draggable={true}
      onMouseDown={e => {
        startDrag(e);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        background: bgColor,
      }}
    >
      <NodeIcon
        className={styles['sub-canvas-logo']}
        nodeId={parentNode.id}
        size={24}
        alt="logo"
      />
      <p
        className={styles['sub-canvas-title']}
        data-testid={concatTestId(getNodeTestId(), 'title')}
      >
        {title}
      </p>
      {tooltip ? (
        <AutoSizeTooltip
          showArrow
          position="top"
          content={<span>{tooltip}</span>}
          className={styles['sub-canvas-tooltip']}
        >
          <IconInfo
            className={styles['sub-canvas-tooltip-icon']}
            data-testid={concatTestId(getNodeTestId(), 'tips')}
          />
        </AutoSizeTooltip>
      ) : null}
    </div>
  );
};
