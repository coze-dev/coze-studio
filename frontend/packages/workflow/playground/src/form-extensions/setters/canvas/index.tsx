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
 
import { Suspense, lazy } from 'react';

import { type SetterExtension } from '@flowgram-adapter/free-layout-editor';

import { useInputVariables } from '@/hooks';

const CanvasLazy = lazy(async () => {
  const { Canvas: CanvasNode } = await import('./components/canvas');
  return {
    default: CanvasNode,
  };
});

const Canvas = props => {
  /**
   * useInputVariables 内部使用了 useContext
   * lazyLoad 会导致 监听不到 context 的变化
   * 所以提前获取 variables
   */
  const variables = useInputVariables({
    needNullType: true,
    needNullName: true,
  });

  return (
    <Suspense fallback={<div>canvas loading...</div>}>
      <CanvasLazy {...props} variables={variables} />
    </Suspense>
  );
};

/**
 *  imageflow 的画布编辑节点，基于 fabric 实现
 */
export const canvas: SetterExtension = {
  key: 'canvas',
  component: Canvas,
};
