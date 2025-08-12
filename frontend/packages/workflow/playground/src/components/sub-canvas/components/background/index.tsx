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
