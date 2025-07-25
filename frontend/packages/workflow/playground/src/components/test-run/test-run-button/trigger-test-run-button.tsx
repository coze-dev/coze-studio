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
 
/**
 * 触发器节点触发试运行的按钮
 */
import { useMemo, useState } from 'react';

import { getTriggerId } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlayCircle, IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip, type ButtonProps } from '@coze-arch/coze-design';

import { useValidateWorkflow } from '@/hooks/use-validate-workflow';
import {
  useWorkflowRunService,
  useGlobalState,
  useTestFormState,
  useExecStateEntity,
  useFloatLayoutService,
  useTestRunReporterService,
} from '@/hooks';

type TriggerTestRunButtonProps = Pick<
  ButtonProps,
  'size' | 'color' | 'className'
> & {
  triggerId?: string;
};

export const TriggerTestRunButton: React.FC<
  TriggerTestRunButtonProps
> = props => {
  const globalState = useGlobalState();
  const testFormState = useTestFormState();
  const runService = useWorkflowRunService();
  const execState = useExecStateEntity();
  const { validate } = useValidateWorkflow();
  const testRunReporterService = useTestRunReporterService();
  const floatLayoutService = useFloatLayoutService();
  const {
    config: { saving },
    workflowId,
  } = globalState;
  const {
    config: { frozen },
  } = testFormState;
  const {
    config: { executeId },
  } = execState;

  const [canceling, setCanceling] = useState(false);
  /** triggerId 是从一个缓存 map 里面直接获取，不是响应式，组件初始化时不一定有 */
  const [innerTriggerId, setInnerTriggerId] = useState(
    props.triggerId ?? getTriggerId(workflowId),
  );

  /**
   * 禁止试运行
   * 1. 保存中的流程
   * 2. 冻结中的流程
   */
  const disabled = useMemo(() => saving || !!frozen, [saving, frozen]);

  /**
   * 可取消试运行
   * 1. 当流程处于冻结状态，且是本 triggerId 触发的运行
   * 2. 存在 executeId
   * 当流程处于冻结态，并且冻结 id 等于本 triggerId，则可以通过本组件取消运行
   */
  const canCancel = useMemo(
    () => !!frozen && frozen === innerTriggerId && !!executeId,
    [frozen, innerTriggerId, executeId],
  );

  const handleTestRun = async () => {
    testRunReporterService.tryStart({
      scene: 'trigger',
    });
    if (await validate()) {
      floatLayoutService.open('problemPanel', 'bottom');
      return;
    }
    /** 运行前更新一下 triggerId */
    const next = innerTriggerId ? innerTriggerId : getTriggerId(workflowId);
    if (innerTriggerId !== next && next) {
      setInnerTriggerId(next);
    }
    if (next) {
      runService.testRunTrigger(next);
    }
  };
  const handleCancelTestRun = async () => {
    try {
      setCanceling(true);
      await runService.cancelTestRun();
    } finally {
      setCanceling(false);
    }
  };

  if (canCancel) {
    return (
      <Tooltip
        content={I18n.t('workflow_testrun_one_node_cancel_run_tooltips')}
      >
        <IconButton
          color="secondary"
          disabled={canceling}
          onClick={handleCancelTestRun}
          icon={<IconCozStopCircle />}
        />
      </Tooltip>
    );
  }

  return (
    <IconButton
      color="secondary"
      disabled={disabled}
      onClick={handleTestRun}
      icon={<IconCozPlayCircle />}
      {...props}
    />
  );
};
