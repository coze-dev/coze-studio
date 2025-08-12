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

import { useEffect, useState, type ReactNode } from 'react';

import { isEqual } from 'lodash-es';
import cls from 'classnames';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeData,
  type CommonNodeData,
  type NodeData,
} from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import {
  Tag,
  Avatar,
  Popover,
  Typography,
  Toast,
} from '@coze-arch/coze-design';

import { type NodeError } from '@/entities/workflow-exec-state-entity';

import { useScrollToError } from '../execute-result/execute-result-side-sheet/hooks/use-scroll-to-error';
import { COLOR_STYLE_MAP } from '../../workflow-header/constants';
import { IconLineError } from '../../line-popover/svg';
import { LineErrorTip } from '../../line-popover';

import styles from './styles.module.less';

const { Text } = Typography;

// Avoid losing icon and title information after node deletion
export const useMetaMemo = (nodeId: string) => {
  const [nodeMeta, setNodeMeta] = useState<CommonNodeData>();
  const playground = usePlayground();

  const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);
  const nodeData = node?.getData<WorkflowNodeData>(WorkflowNodeData);
  const meta = nodeData?.getNodeData<keyof NodeData>();

  useEffect(() => {
    if (meta && !isEqual(nodeMeta, meta)) {
      setNodeMeta(meta);
    }
  }, [meta]);

  return nodeMeta;
};

export const ErrorItem = ({
  nodeError,
  title,
  icon,
  popover,
  onClick,
}: {
  nodeError: NodeError;
  title: string;
  icon: ReactNode;
  popover?: ReactNode;
  onClick?: () => void;
}) => {
  const { errorInfo, errorLevel } = nodeError;

  const color =
    errorLevel === 'error'
      ? COLOR_STYLE_MAP.Danger.color
      : COLOR_STYLE_MAP.Warning.color;

  return (
    <div
      className={cls(styles['error-item'], 'flex items-center')}
      onClick={onClick}
    >
      {icon}
      <div className={cls(styles['error-item-text'], 'flex flex-col ml-3')}>
        <div className="w-full flex space-x-1 items-center">
          <div className="overflow-hidden">
            <Text ellipsis={{ showTooltip: true }} weight={500}>
              {title}
            </Text>
          </div>
          {errorLevel === 'warning' ? (
            <div>
              <Tag prefixIcon={null} color="primary">
                {I18n.t('workflow_exception_ignore_tag')}
              </Tag>
            </div>
          ) : undefined}
          {popover ? (
            <Popover content={popover} showArrow className="p-4">
              <IconCozInfoCircle className="text-[#A7A9B0] text-[11px] min-w-[24px]" />
            </Popover>
          ) : null}
        </div>

        <div className="flex items-center">
          <Text
            ellipsis={{ showTooltip: true, rows: 3 }}
            size="small"
            style={{ color }}
          >
            {errorInfo}
          </Text>
        </div>
      </div>
    </div>
  );
};

export const ErrorNodeItem = ({ nodeError }: { nodeError: NodeError }) => {
  const { nodeId } = nodeError;

  const nodeMeta = useMetaMemo(nodeId);

  const scrollToError = useScrollToError();

  const { icon } = nodeMeta || {};

  const onClick = async () => {
    const scrolled = await scrollToError(nodeError);
    if (!scrolled) {
      Toast.error(I18n.t('workflow_node_has_delete'));
    }
  };

  return (
    <ErrorItem
      nodeError={nodeError}
      title={nodeMeta?.title || ''}
      icon={<Avatar src={icon} shape="square" size="small" />}
      onClick={onClick}
    />
  );
};

export const ErrorLineItem = ({
  nodeError,
  index,
}: {
  nodeError: NodeError;
  index: number;
}) => {
  const scrollToError = useScrollToError();

  const onClick = async () => {
    const scrolled = await scrollToError(nodeError);
    if (!scrolled) {
      Toast.error(I18n.t('workflow_connection_delete'));
    }
  };

  return (
    <ErrorItem
      nodeError={nodeError}
      title={`${I18n.t('workflow_connection_name')}${index + 1}`}
      icon={<IconLineError />}
      onClick={onClick}
      popover={<LineErrorTip />}
    />
  );
};
