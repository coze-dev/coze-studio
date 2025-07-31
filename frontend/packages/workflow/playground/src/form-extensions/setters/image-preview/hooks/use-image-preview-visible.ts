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
 * According to the input and output of the node, determine whether to display the picture preview module
 */
export const useImagePreviewVisible = () => {
  const node: FlowNodeEntity = useCurrentEntity();

  const { flowNodeType } = node;

  const inputContainsImage = useInputContainsImage(node);

  // The starting node is not required
  if (flowNodeType === StandardNodeType.Start) {
    return false;
  }

  // The input of the end node and the message node is the output. When the input refers to the image type, it needs to be displayed
  if (isInputAsOutput(flowNodeType as StandardNodeType)) {
    return inputContainsImage;
  } else {
    // When the output contains a picture type, it needs to be displayed
    return isOutputsContainsImage(node);
  }
};
