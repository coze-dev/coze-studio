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

import { useCallback, useState } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';

import { useRefVariablePathList } from './use-ref-variable-path-list';
import { useListenVariableChange } from './use-listen-variable-change';

export const useInputContainsImage = (node: FlowNodeEntity) => {
  const [inputContainsImage, setInputContainsImage] = useState(false);

  const variablePathList = useRefVariablePathList();

  const getInputContainsImage = useCallback(
    () =>
      variablePathList.some(path => {
        const variable = node.context.variableService.getViewVariableByKeyPath(
          path,
          { node },
        );
        return [
          ViewVariableType.Image,
          ViewVariableType.ArrayImage,
          ViewVariableType.Svg,
          ViewVariableType.ArraySvg,
        ].includes(variable?.type);
      }),
    [node, variablePathList],
  );

  // Trigger recalculation after listening for variable changes
  useListenVariableChange({
    variablePathList,
    callback: () => setInputContainsImage(getInputContainsImage()),
  });

  return inputContainsImage;
};
