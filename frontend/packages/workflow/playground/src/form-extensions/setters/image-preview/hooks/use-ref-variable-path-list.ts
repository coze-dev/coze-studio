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
 * 获取节点inputs中的引用变量路径列表
 */
export const useRefVariablePathList = () => {
  const workflowNode = useWorkflowNode();
  const [pathList, setPathList] = useState<Array<Array<string>>>([]);
  const node = useCurrentEntity();

  // 非目标节点直接返回一个空列表，避免不必要的监听
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
