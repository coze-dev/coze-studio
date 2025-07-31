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
 * The trigger node triggers the practice run button
 */
import { useMemo, useState } from 'react';

import { getTriggerId } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozPlayCircle,
  IconCozStopCircle,
} from '@coze-arch/coze-design/icons';
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
  /** The triggerId is directly obtained from a cache map, not reactive, and may not be available when the component is initialized */
  const [innerTriggerId, setInnerTriggerId] = useState(
    props.triggerId ?? getTriggerId(workflowId),
  );

  /**
   * No practice running
   * 1. Saving process
   * 2. Process in freeze
   */
  const disabled = useMemo(() => saving || !!frozen, [saving, frozen]);

  /**
   * Cancel practice run
   * 1. When the process is frozen and is triggered by this triggerId
   * 2. Existence of executeId
   * When the process is in a frozen state and the frozen id is equal to this triggerId, the execution can be cancelled through this component
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
    /** Update the triggerId before running. */
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
