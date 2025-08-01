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

import { useState } from 'react';

import { isEqual } from 'lodash-es';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type StandardNodeType,
  useWorkflowNode,
  type RefExpressionContent,
} from '@coze-workflow/base';

import { isInputAsOutput } from '../utils';

/**
 * Get the list of reference variable paths in node inputs
 */
export const useRefVariablePathList = () => {
  const workflowNode = useWorkflowNode();
  const [pathList, setPathList] = useState<Array<Array<string>>>([]);
  const node = useCurrentEntity();

  // Non-target nodes directly return an empty list to avoid unnecessary listening
  if (!isInputAsOutput(node?.flowNodeType as StandardNodeType)) {
    return [];
  }

  const { inputParameters } = workflowNode || {};
  const keyPathList = (inputParameters || []).reduce(
    (list: Array<Array<string>>, i) => {
      if (i.input?.type === 'ref') {
        const variablePath = (i.input.content as RefExpressionContent)?.keyPath;

        if (variablePath) {
          return [...list, variablePath];
        }
      }
      return list;
    },
    [],
  );

  if (!isEqual(pathList, keyPathList)) {
    setPathList(keyPathList);
  }

  return pathList;
};
