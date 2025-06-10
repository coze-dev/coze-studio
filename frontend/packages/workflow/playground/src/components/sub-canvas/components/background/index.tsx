import type { FC } from 'react';

import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

import styles from './index.module.less';

export const SubCanvasBackground: FC = () => {
  const { node } = useNodeRender();
  return (
    <div
      className={styles['sub-canvas-background']}
      data-flow-editor-selectable="true"
    >
      <svg width="100%" height="100%">
        <pattern
          id="sub-canvas-dot-pattern"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" stroke="#eceeef" fillOpacity="0.5" />
        </pattern>
        <rect
          width="100%"
          height="100%"
          fill="url(#sub-canvas-dot-pattern)"
          data-node-panel-container={node.id}
        />
      </svg>
    </div>
  );
};
