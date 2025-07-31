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

import { useCallback, useEffect, useState } from 'react';

import {
  NodeIntoContainerService,
  NodeIntoContainerType,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useNodeRender } from '@flowgram-adapter/free-layout-editor';

import { TipsGlobalStore } from './global-store';

export const useControlTips = () => {
  const { node } = useNodeRender();
  const [visible, setVisible] = useState(false);
  const globalStore = TipsGlobalStore.instance;

  const nodeIntoContainerService = useService<NodeIntoContainerService>(
    NodeIntoContainerService,
  );

  const show = useCallback(() => {
    if (globalStore.isClosed()) {
      return;
    }

    setVisible(true);
  }, [globalStore]);

  const close = useCallback(() => {
    globalStore.close();
    setVisible(false);
  }, [globalStore]);

  const closeForever = useCallback(() => {
    globalStore.closeForever();
    close();
  }, [close, globalStore]);

  useEffect(() => {
    // monitor move in
    const inDisposer = nodeIntoContainerService.on(e => {
      if (e.type !== NodeIntoContainerType.In) {
        return;
      }
      if (e.targetContainer === node) {
        show();
      }
    });
    // listen for move-out events
    const outDisposer = nodeIntoContainerService.on(e => {
      if (e.type !== NodeIntoContainerType.Out) {
        return;
      }
      if (e.sourceContainer === node && !node.blocks.length) {
        setVisible(false);
      }
    });
    return () => {
      inDisposer.dispose();
      outDisposer.dispose();
    };
  }, [nodeIntoContainerService, node, show, close, visible]);

  return {
    visible,
    close,
    closeForever,
  };
};
