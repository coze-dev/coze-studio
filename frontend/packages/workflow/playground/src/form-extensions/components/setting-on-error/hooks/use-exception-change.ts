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
 * Exception wiring and port handling
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
   * Node of dynamic port, just update the port.
   */
  if (isSettingOnErrorDynamicPort(node.flowNodeType as StandardNodeType)) {
    portsData.updateDynamicPorts();
    return;
  }

  /**
   * Node on static port
   * From normal to abnormal scenes, you need to change the output without portID to default, and complete the corresponding connection
   * From an exception to an abnormal scene, you need to set the original connection with portID as default to empty, and complete the corresponding connection
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
 * exception handling change triggering
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
