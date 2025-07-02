import { useCallback, useState, useEffect } from 'react';

import { usePlayground } from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../model';
import { CommentEditorEvent } from '../constant';

export const useOverflow = (params: {
  model: CommentEditorModel;
  height: number;
}) => {
  const { model, height } = params;
  const playground = usePlayground();

  const [overflow, setOverflow] = useState(false);

  const isOverflow = useCallback((): boolean => {
    if (!model.element) {
      return false;
    }
    const containerHeight = height * playground.config.zoom;
    const { height: editorHeight } = model.element.getBoundingClientRect();
    return editorHeight > containerHeight;
  }, [model, height, playground]);

  // 更新 overflow
  const updateOverflow = useCallback(() => {
    setOverflow(isOverflow());
  }, [isOverflow]);

  // 监听高度变化
  useEffect(() => {
    updateOverflow();
  }, [height, updateOverflow]);

  // 监听 change 事件
  useEffect(() => {
    const changeDispose = model.on<CommentEditorEvent.Change>(
      CommentEditorEvent.Change,
      () => {
        updateOverflow();
      },
    );
    return () => {
      changeDispose();
    };
  }, [model, updateOverflow]);

  return { overflow, updateOverflow };
};
