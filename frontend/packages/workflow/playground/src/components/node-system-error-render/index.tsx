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

import classNames from 'classnames';
import {
  type FlowNodeEntity,
  FlowNodeErrorData,
  useService,
  type NodeErrorRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography, UIButton } from '@coze-arch/bot-semi';
import { IconAlertFilled } from '@coze-arch/bot-icons';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';

import { NodeIcon } from '../node-icon';
import { WorkflowEditService } from '../../services';
import { useGlobalState, useNodeRenderScene } from '../../hooks';

const { Text, Title } = Typography;

export const SystemError = ({ node }: { node: FlowNodeEntity }) => {
  const globalState = useGlobalState();
  const { isNewNodeRender } = useNodeRenderScene();

  const nodeData = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeMeta = nodeData.getNodeData<keyof NodeData>();

  const errorData = node.getData<FlowNodeErrorData>(FlowNodeErrorData);
  const error = errorData.getError();

  const { title, description } = nodeMeta || {};

  const editService = useService<WorkflowEditService>(WorkflowEditService);

  const handleDelete = () => {
    editService.deleteNode(node);
  };

  const showDeleteButton = ![
    StandardNodeType.Start,
    StandardNodeType.End,
  ].includes(node.flowNodeType as StandardNodeType);

  return (
    <div className={isNewNodeRender ? 'w-full p-12px' : 'h-[242px] w-[482px]'}>
      <div
        className={classNames(
          'flex items-center space-x-2',
          'absolute top-0 left-0',
          'w-full h-[46px]',
          'rounded-t-[7px]',
          'px-4 py-3',
          'bg-[--semi-color-danger-light-default]',
        )}
      >
        <IconAlertFilled size="extra-large" className="text-[#ff441e]" />
        <span className="text-[14px]">{error?.message}</span>
      </div>

      <div
        className={classNames(
          'flex flex-col justify-center items-center space-y-[10px]',
          'h-full',
          'mt-[46px]',
        )}
      >
        <NodeIcon nodeId={node.id} size={72} />
        <Title heading={6}>{title}</Title>

        <div className="max-w-[400px] max-h-[44px]">
          <Text type="quaternary" ellipsis={{ showTooltip: true, rows: 2 }}>
            {description}
          </Text>
        </div>
        <div>
          {!globalState.readonly && showDeleteButton ? (
            <UIButton
              type="tertiary"
              icon={<IconCozTrashCan />}
              onClick={handleDelete}
            >
              {I18n.t('Delete')}
            </UIButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export const nodeSystemErrorRender = ({ context }: NodeErrorRenderProps) => (
  <SystemError node={context.node} />
);
