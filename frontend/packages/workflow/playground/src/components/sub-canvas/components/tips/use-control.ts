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
    // 监听移入
    const inDisposer = nodeIntoContainerService.on(e => {
      if (e.type !== NodeIntoContainerType.In) {
        return;
      }
      if (e.targetContainer === node) {
        show();
      }
    });
    // 监听移出事件
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
