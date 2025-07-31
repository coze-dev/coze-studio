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

import React, { useMemo } from 'react';

import classNames from 'classnames';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useNodeRender } from '@flowgram-adapter/free-layout-editor';
import { NodeStatusBar } from '@coze-workflow/test-run/log';
import { NodeExeStatus } from '@coze-workflow/base/api';
import { CONVERSATION_NODES, StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Spin, Typography } from '@coze-arch/bot-semi';
import {
  IconWorkflowRunning,
  IconWorkflowRunSuccess,
} from '@coze-arch/bot-icons';
import {
  IconCozWarningCircleFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Tag } from '@coze-arch/coze-design';

import { TestRunCostPopover } from '../../test-run/execute-result/test-run-cost-popover';
import { ExecuteResultPanel } from '../../test-run/execute-result/execute-result-panel';
import { useGlobalState } from '../../../hooks';
import { ViewDataButton } from './view-data-button';
import { useStatus } from './use-status';
import { useSettingOnErrorDesc } from './use-setting-on-error-desc';

import styles from './styles.module.less';

interface ExecuteStatusBarProps {
  node: FlowNodeEntity;
  className?: string;
  style?: React.CSSProperties;
}

const { Text } = Typography;

export const ExecuteStatusBarContent: React.FC<ExecuteStatusBarProps> = ({
  node,
}) => {
  const { id, flowNodeType: nodeType } = node;
  const { playgroundProps, projectId, spaceId, getProjectApi } =
    useGlobalState();

  const isLLM = nodeType === StandardNodeType.LLM;

  const {
    hasExecuteResult,
    nodeStatus,
    nodeExeCost,
    tokenAndCost,
    needAuth,
    handleAuth,
    runProjectId,
    errorLevel,
  } = useStatus(id);
  const settingOnErrorDesc = useSettingOnErrorDesc(id);
  const { selectNode } = useNodeRender();

  // Node 4 states
  const isNodeSuccess = nodeStatus === NodeExeStatus.Success;
  const isNodeRunning = nodeStatus === NodeExeStatus.Running;

  const isNodeWarning = errorLevel === 'warning';
  const isNodeError = errorLevel === 'error';
  const isNodePending = errorLevel === 'pending';

  /** Results The default expansion mode supports external configuration. If there is no external configuration, the image stream is expanded by default. */
  const defaultResultCollapseMode = playgroundProps.defaultResultCollapseMode
    ? 'all'
    : 'end';
  /**
   * Default expansion mode
   * Error reporting node expanded by default
   */
  const defaultShowPanel = defaultResultCollapseMode === 'all';

  const hasConversation =
    !!runProjectId && CONVERSATION_NODES.includes(nodeType as StandardNodeType);

  const tagColor = useMemo(() => {
    if (isNodeSuccess) {
      return 'green';
    }
    if (isNodeError) {
      return 'red';
    }
    if (isNodeRunning) {
      return 'blue';
    }
    if (isNodeWarning) {
      return 'yellow';
    }
  }, [isNodeSuccess, isNodeError, isNodeRunning, isNodeWarning]);

  const renderIcon = () => {
    if (isNodeRunning) {
      return (
        <Spin
          size="small"
          wrapperClassName={styles['spin-container']}
          indicator={
            <IconWorkflowRunning
              className={classNames(styles['status-icon'])}
            />
          }
        />
      );
    }
    if (isNodeSuccess && !isNodeWarning) {
      return <IconWorkflowRunSuccess className={styles['status-icon']} />;
    }
    return (
      <IconCozWarningCircleFill
        className={classNames(styles['status-icon'], 'text-[20px]', {
          'text-[--semi-color-danger]': isNodeError,
          'text-[--semi-color-warning]': isNodeWarning,
          'text-[--semi-color-secondary]': isNodePending,
        })}
      />
    );
  };
  const renderDesc = () => {
    const getDesc = () => {
      if (isNodeRunning) {
        return I18n.t('workflow_detail_title_testrun_running', {}, 'Running');
      } else if (isNodePending) {
        return I18n.t('workflow_node_stoprun', {}, 'Run terminated');
      } else if (isNodeSuccess) {
        return (
          settingOnErrorDesc ||
          I18n.t('workflow_detail_title_testrun_succeed_node', {}, 'Succeed')
        );
      } else if (isNodeError) {
        return I18n.t(
          'workflow_detail_title_testrun_failed_node',
          {},
          'Failed',
        );
      }
    };

    const desc = getDesc();

    return desc ? (
      <Text
        className={styles['font-normal']}
        ellipsis={{ showTooltip: true }}
        data-testid="workflow.detail.node.testrun.status"
      >
        {desc}
      </Text>
    ) : null;
  };
  const renderCostPopover = () => {
    if (!isLLM || !FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT || !hasExecuteResult) {
      return null;
    }
    return (
      <TestRunCostPopover
        tokenAndCost={tokenAndCost || {}}
        popoverProps={{ position: 'top' }}
        className="leading-none"
      >
        <Tag suffixIcon={<IconCozInfoCircle />} size="mini" color={tagColor}>
          {I18n.t('analytic_query_table_title_tokens')}
        </Tag>
      </TestRunCostPopover>
    );
  };

  const handleJumpToProjectConversation = () => {
    const projectApi = getProjectApi();
    if (projectId && projectApi) {
      projectApi.sendMsgOpenWidget('/session', {
        name: 'tab',
        data: { value: 'testrun' },
      });
    } else {
      window.open(`/space/${spaceId}/project-ide/${runProjectId}/session`);
    }
  };

  return (
    <NodeStatusBar
      defaultShowDetail={defaultShowPanel}
      hasExecuteResult={hasExecuteResult}
      needAuth={needAuth}
      onAuth={handleAuth}
      hasConversation={hasConversation}
      onJumpToProjectConversation={handleJumpToProjectConversation}
      header={
        <>
          {renderIcon()}
          {renderDesc()}
          {nodeExeCost ? (
            <Tag size="mini" color={tagColor} className="shrink-0">
              {nodeExeCost}
            </Tag>
          ) : null}
          {renderCostPopover()}
        </>
      }
      extraBtns={
        [
          StandardNodeType.Database,
          StandardNodeType.DatabaseQuery,
          StandardNodeType.DatabaseUpdate,
          StandardNodeType.DatabaseDelete,
          StandardNodeType.DatabaseCreate,
        ].includes(`${nodeType}` as StandardNodeType)
          ? [<ViewDataButton />]
          : []
      }
    >
      <ExecuteResultPanel
        id={id}
        node={node}
        onClick={e => {
          e.stopPropagation();
          selectNode(e);
        }}
        onOpenWorkflowLink={data => {
          const { workflowId, executeId, subExecuteId } = data;
          const projectApi = getProjectApi();

          if (projectId && projectApi) {
            // in-app jump
            projectApi.sendMsgOpenWidget(`/workflow/${workflowId}`, {
              name: 'debug',
              data: {
                executeId,
                subExecuteId,
              },
            });
          } else {
            // Resource library or operation and maintenance platform jump
            const url = new URL(window.location.href);
            const params = new URLSearchParams();

            // Add/update query parameters to keep only these 4 parameters, including space_id
            params.append('space_id', url.searchParams.get('space_id') || '0');
            params.append('workflow_id', workflowId);
            params.append('execute_id', executeId);
            params.append('sub_execute_id', subExecuteId);

            // Build a new URL
            url.search = params.toString();

            // Open in a new tab
            window.open(url.toString(), '_blank');
          }
        }}
      />
    </NodeStatusBar>
  );
};
