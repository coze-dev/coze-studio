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
 
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

import { isInputAsOutput, isOutputsContainsImage } from '../utils';
import { useInputContainsImage } from './use-input-contains-image';

/**
 * 根据节点的input和output，判断是否显示图片预览模块
 */
export const useImagePreviewVisible = () => {
  const node: FlowNodeEntity = useCurrentEntity();

  const { flowNodeType } = node;

  const inputContainsImage = useInputContainsImage(node);

  // 开始节点不需要
  if (flowNodeType === StandardNodeType.Start) {
    return false;
  }

  // end节点和message节点的输入就是输出，当输入引用了图片类型时，需要展示
  if (isInputAsOutput(flowNodeType as StandardNodeType)) {
    return inputContainsImage;
  } else {
    // output中包含图片类型时，需要展示
    return isOutputsContainsImage(node);
  }
};
