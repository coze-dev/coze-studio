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

  // 监听变量变化后触发重新计算
  useListenVariableChange({
    variablePathList,
    callback: () => setInputContainsImage(getInputContainsImage()),
  });

  return inputContainsImage;
};
