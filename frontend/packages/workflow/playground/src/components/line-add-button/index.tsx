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

import { type StandardNodeType } from '@coze-workflow/base';
import { Toast } from '@coze-arch/coze-design';
import { WorkflowNodePanelService } from '@flowgram-adapter/free-layout-editor';
import { type LineRenderProps } from '@flowgram-adapter/free-layout-editor';
import {
  usePlayground,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import {
  LineColors,
  LineType,
  type WorkflowLineEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type IPoint } from '@flowgram-adapter/common';

import { WorkflowCustomDragService } from '@/services';

import { IconPlusCircle } from './button';

const useVisible = (params: {
  line: WorkflowLineEntity;
  selected?: boolean;
  color?: string;
}): boolean => {
  const playground = usePlayground();
  const { line, selected = false, color } = params;
  if (line.disposed) {
    // After dispose, getting line.to | line.from will cause an error to create a port
    return false;
  }
  if (playground.config.readonly) {
    return false;
  }
  if (!selected && color !== LineColors.HOVER) {
    return false;
  }
  if (
    line.fromPort.portID === 'loop-output-to-function' &&
    line.toPort?.portID === 'loop-function-input'
  ) {
    return false;
  }
  if (
    line.fromPort.portID === 'batch-output-to-function' &&
    line.toPort?.portID === 'batch-function-input'
  ) {
    return false;
  }
  return true;
};

export const LineAddButton = (props: LineRenderProps) => {
  const { line, selected, color, lineType } = props;
  const visible = useVisible({ line, selected, color });
  const nodePanelService = useService<WorkflowNodePanelService>(
    WorkflowNodePanelService,
  );
  const dragService = useService(WorkflowCustomDragService);

  if (!visible) {
    return <></>;
  }

  const { fromPort, toPort } = line;
  const { to, from } = line.position;

  const isBezierLine: boolean = lineType === LineType.BEZIER;
  const mid: IPoint = {
    x: (to.x + from.x) / 2,
    y: (to.y + from.y) / 2,
  };

  return (
    <div
      className="workflow-line-add-button absolute translate-x-[-50%] translate-y-[-60%] w-[24px] h-[24px] cursor-pointer"
      style={{
        left: isBezierLine ? '50%' : mid.x,
        top: isBezierLine ? '50%' : mid.y,
        color,
      }}
      data-testid="sdk.workflow.canvas.line.add"
      data-line-id={line.id}
      onClick={async () => {
        const node = await nodePanelService.call({
          panelPosition: {
            x: (line.position.from.x + line.position.to.x) / 2,
            y: (line.position.from.y + line.position.to.y) / 2,
          },
          fromPort,
          toPort,
          enableBuildLine: true,
          enableAutoOffset: true,
          panelProps: {
            enableScrollClose: true,
          },
          canAddNode: ({ nodeType, containerNode }) => {
            const canDropMessage = dragService.canDropToNode({
              dragNodeType: nodeType as StandardNodeType,
              dropNode: containerNode,
            });
            if (!canDropMessage.allowDrop) {
              Toast.warning({
                content: canDropMessage.message,
              });
              return false;
            }
            return canDropMessage.allowDrop;
          },
        });
        if (!node) {
          return;
        }
        line.dispose();
      }}
    >
      <IconPlusCircle />
    </div>
  );
};
