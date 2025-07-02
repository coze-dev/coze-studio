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
