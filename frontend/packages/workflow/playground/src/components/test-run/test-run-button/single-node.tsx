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

import React, { useCallback } from 'react';

import {
  useEntityFromContext,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useValidationService } from '@coze-workflow/base/services';
import { StandardNodeType, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPlayFill,
  IconCozStopCircle,
} from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip, Toast } from '@coze-arch/coze-design';

import { WorkflowRunService } from '@/services';
import { LayoutPanelKey } from '@/constants';

import { useTestRunStatus } from '../hooks/use-test-run-status';
import { useTestFormSchema } from '../hooks/use-test-form-schema';
import { useCancelTestRun } from '../hooks/use-cancel-test-run';
import {
  useGlobalState,
  useTestFormState,
  useNodeRenderScene,
  useFloatLayoutService,
  useTestRunReporterService,
} from '../../../hooks';

export const TestRunSingleNodeButton: React.FC = () => {
  const node = useEntityFromContext<WorkflowNodeEntity>();
  const { getNodeSetterId } = useNodeTestId();
  const floatLayoutService = useFloatLayoutService();
  const validationService = useValidationService();
  const testRunReporterService = useTestRunReporterService();
  const { isNodeSideSheet } = useNodeRenderScene();
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const { playgroundProps } = useGlobalState();

  const { loading, disabled, isMineRunning } = useTestRunStatus(node.id);
  const testFormState = useTestFormState();
  const { cancelTestRun, canceling } = useCancelTestRun();
  const { generate } = useTestFormSchema(node);

  const handleOpenTestFormV2 = useCallback(
    async e => {
      e.stopPropagation();

      testRunReporterService.tryStart({
        scene: 'node',
      });

      const { hasError } = await validationService.validateNode(node);

      if (hasError) {
        Toast.error({
          content: I18n.t('workflow_detail_toast_validation_failed'),
          showClose: false,
        });
      }

      if (isNodeSideSheet) {
        if (hasError) {
          return;
        }

        testFormState.showTestNodeForm();
      } else {
        floatLayoutService.open(LayoutPanelKey.NodeForm, 'right', {
          node,
          showTestNodeForm: !hasError,
        });

        if (hasError) {
          return;
        }

        testFormState.showTestNodeForm();
      }
      const schema = await generate();
      if (schema?.fields.length) {
        return;
      }
      runService.clearTestRun();
      runService.testRunOneNode({ nodeId: node.id });
    },
    [testFormState],
  );

  /**
   * - condition, start, end no single node operation required
   * - Globally configure whether canTestRun can practice running
   * - Process component property configuration disabledSingleNodeTest whether to disable single node practice run
   */
  if (
    [
      StandardNodeType.Start,
      StandardNodeType.End,
      StandardNodeType.If,
    ].includes(node.flowNodeType as StandardNodeType) ||
    playgroundProps.disabledSingleNodeTest ||
    !node.getNodeRegistry()?.meta?.test
  ) {
    return null;
  }

  if (isMineRunning) {
    return (
      <Tooltip
        key={`${node.id}-cancel-test-run`}
        content={I18n.t('workflow_testrun_one_node_cancel_run_tooltips')}
      >
        <IconButton
          color="secondary"
          size={isNodeSideSheet ? 'default' : 'small'}
          icon={<IconCozStopCircle />}
          onClick={cancelTestRun}
          disabled={canceling}
          data-testid={getNodeSetterId('testonenode_cancel')}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip
      key={`${node.id}-test-run`}
      content={I18n.t('workflow_debug_testonenode')}
    >
      <IconButton
        color="secondary"
        size={isNodeSideSheet ? 'default' : 'small'}
        disabled={disabled}
        icon={<IconCozPlayFill />}
        onClick={handleOpenTestFormV2}
        loading={loading}
        data-testid={getNodeSetterId('testonenode')}
      />
    </Tooltip>
  );
};
