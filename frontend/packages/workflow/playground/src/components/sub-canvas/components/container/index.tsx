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

/* eslint-disable react-hooks/exhaustive-deps -- custom */
import { useEffect, useState, type FC, type ReactNode } from 'react';

import classNames from 'classnames';
import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import {
  useNodeRender,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowEditService } from '@/services';

import { useParentNode, useSubCanvasRenderProps } from '../../hooks';

import styles from './index.module.less';

interface ISubCanvasContainer {
  children: ReactNode[];
}

export const SubCanvasContainer: FC<ISubCanvasContainer> = ({ children }) => {
  const { node, selected, selectNode, nodeRef } = useNodeRender();
  const editService = useService(WorkflowEditService);
  const nodeMeta = node.getNodeMeta();
  const { size = { width: 300, height: 200 } } = nodeMeta;
  const { style = {} } = useSubCanvasRenderProps();

  const transform = node.getData<FlowNodeTransformData>(FlowNodeTransformData);
  const [width, setWidth] = useState(size.width);
  const [height, setHeight] = useState(size.height);

  const parentNode = useParentNode();

  useEffect(() => {
    const updateSize = () => {
      // When there is no sub-node
      if (node.collapsedChildren.length === 0) {
        const parentTransform = parentNode.getData<FlowNodeTransformData>(
          FlowNodeTransformData,
        );
        setWidth(parentTransform.bounds.width ?? size.width);
        setHeight(parentTransform.bounds.height ?? size.height);
        return;
      }
      // When there is a sub-node, it only listens for width and height changes
      if (width !== transform.bounds.width) {
        setWidth(transform.bounds.width);
      }
      if (height !== transform.bounds.height) {
        setHeight(transform.bounds.height);
      }
    };
    updateSize();
    const dispose = transform.onDataChange(() => {
      updateSize();
    });
    return () => dispose.dispose();
  }, [parentNode, transform]);

  return (
    <div
      className={classNames(styles['sub-canvas-container'], {
        selected,
      })}
      style={{
        width,
        height,
        ...style,
      }}
      ref={nodeRef}
      data-node-selected={String(selected)}
      onMouseDown={selectNode}
      onClick={e => {
        selectNode(e);
        editService.focusNode();
      }}
    >
      {children}
    </div>
  );
};
