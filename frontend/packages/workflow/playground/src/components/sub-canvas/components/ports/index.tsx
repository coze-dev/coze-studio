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

import { useEffect, type FC } from 'react';

import {
  WorkflowNodePortsData,
  useNodeRender,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowPortRender } from '@coze-workflow/render';
import { useNodeTestId } from '@coze-workflow/base';

import { useSubCanvasRenderProps } from '../../hooks';

export const SubCanvasPorts: FC = () => {
  const { node, ports } = useNodeRender();
  const { renderPorts } = useSubCanvasRenderProps();

  const { getNodeTestId, concatTestId } = useNodeTestId();
  const testId = getNodeTestId();

  useEffect(() => {
    const portsData = node.getData<WorkflowNodePortsData>(
      WorkflowNodePortsData,
    );
    portsData.updateDynamicPorts();
  }, [node]);

  return (
    <>
      {renderPorts.map(p => (
        <div
          key={`canvas-port${p.id}`}
          className="sub-canvas-port"
          data-port-id={p.id}
          data-port-type={p.type}
          style={p.style}
          data-testid={concatTestId(testId, 'port', p.id)}
        />
      ))}
      {ports.map(p => (
        <WorkflowPortRender key={p.id} entity={p} />
      ))}
    </>
  );
};
