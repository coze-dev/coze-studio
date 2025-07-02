import { useEffect, useRef } from 'react';

import {
  useCurrentEntity,
  WorkflowDocument,
  WorkflowLinesManager,
  type WorkflowNodeEntity,
  WorkflowNodeLinesData,
  WorkflowNodePortsData,
} from '@flowgram-adapter/free-layout-editor';
import {
  isSettingOnErrorDynamicPort,
  type SettingOnErrorValue,
} from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { isException } from '../utils/is-exception';

/**
 * 异常连线和端口处理
 */
const handleLinesAndPort = ({
  node,
  hasException,
}: {
  node: WorkflowNodeEntity;
  hasException: boolean;
}) => {
  const document = node.getService<WorkflowDocument>(WorkflowDocument);
  const linesManager =
    node.getService<WorkflowLinesManager>(WorkflowLinesManager);
  const { outputLines } = node.getData(WorkflowNodeLinesData);
  const portsData = node.getData<WorkflowNodePortsData>(WorkflowNodePortsData);

  /**
   * 动态端口的节点, 更新端口即可
   */
  if (isSettingOnErrorDynamicPort(node.flowNodeType as StandardNodeType)) {
    portsData.updateDynamicPorts();
    return;
  }

  /**
   * 静态端口的节点
   * 从普通变成有异常的场景, 需要将原来没有portID的output改成default, 并将对应连线补全
   * 从异常变成有异常的场景, 需要将原来有portID为default的连线设为空, 并将对应连线补全
   */
  let lines, outputPort;

  if (hasException) {
    lines = outputLines.filter(
      l => !l.fromPort.portID && l.fromPort.portType === 'output',
    );
    outputPort = { type: 'output', portID: 'default' };
  } else {
    lines = outputLines.filter(
      l => l.fromPort.portID === 'default' && l.fromPort.portType === 'output',
    );
    outputPort = { type: 'output' };
  }

  let newLines;
  if (lines?.length) {
    newLines = lines.map(l => ({
      from: l.info.from,
      to: l.info.to || '',
      fromPort: outputPort.portID || '',
      toPort: l.info.toPort || '',
    }));
    lines.forEach(l => {
      document.removeNode(l);
    });
  }

  portsData.updateStaticPorts([
    {
      type: 'input',
    },
    outputPort,
  ]);

  if (newLines?.length) {
    newLines.forEach(l => {
      linesManager.createLine(l);
    });
  }
};

/**
 * 异常处理变更触发
 */
export const useExceptionChange = ({
  value,
}: {
  value: SettingOnErrorValue;
}) => {
  const lastHasException = useRef(isException(value));
  const node = useCurrentEntity();

  useEffect(() => {
    const hasException = isException(value);
    if (lastHasException.current !== hasException) {
      lastHasException.current = hasException;
      handleLinesAndPort({
        node,
        hasException,
      });
    }
  }, [value, node]);
};
