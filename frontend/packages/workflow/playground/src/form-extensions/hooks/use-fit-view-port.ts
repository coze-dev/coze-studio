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
 
/**
 * 这个 hooks 用于在 side sheet 面板被打开后，处理画布的缩放比例，保证宿主节点居中可见
 */
import { useEffect } from 'react';

import {
  PlaygroundConfigEntity,
  useEntity,
  usePlayground,
  TransformData,
} from '@flowgram-adapter/free-layout-editor';
import { SizeSchema } from '@flowgram-adapter/common';

const SCROLL_TO_VIEW_TIMEOUT = 200;
const BOUNDS_PAD = 30;

/** side sheet 面板打开时，重置画布比例到适合宿主节点的大小 */
export const useFitViewport = (params: {
  enable?: boolean;
  nodeId?: string;
}) => {
  const { enable, nodeId } = params;
  const playgroundConfig = useEntity<PlaygroundConfigEntity>(
    PlaygroundConfigEntity,
  );
  const playground = usePlayground();

  useEffect(() => {
    if (!enable || !nodeId) {
      return;
    }

    setTimeout(() => {
      const currentNode = playground.entityManager.getEntityById(nodeId);
      if (!currentNode) {
        return;
      }

      const { bounds } = currentNode.getData<TransformData>(TransformData);
      bounds.pad(BOUNDS_PAD, BOUNDS_PAD);
      const viewport = playgroundConfig.getViewport(false);
      const zoom = SizeSchema.fixSize(bounds, viewport);

      playgroundConfig.scrollToView({
        bounds,
        zoom,
        scrollToCenter: true,
      });
    }, SCROLL_TO_VIEW_TIMEOUT);
  }, [enable]);
};
