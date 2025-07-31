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

import { I18n } from '@coze-arch/i18n';
import {
  IconCozPlayFill,
  IconCozStopCircle,
} from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useExecStateEntity } from '@/hooks';

import { useTestRunStatus } from '../hooks/use-test-run-status';
import { useCancelTestRun } from '../hooks/use-cancel-test-run';
import { START_NODE_ID } from '../constants';

import styles from './styles.module.less';

interface TestFormSheetFooterV2Props {
  node?: FlowNodeEntity;
  onClick?: (e: React.MouseEvent) => void;
}

const TestRunFlowButton: React.FC<{
  onClick?: (e: React.MouseEvent) => void;
}> = ({ onClick }) => {
  const { loading, disabled, saveLoading, running } =
    useTestRunStatus(START_NODE_ID);
  const { cancelTestRun, canceling } = useCancelTestRun();
  const {
    config: { executeId },
  } = useExecStateEntity();
  /** There are different copies in the save. */
  const text = useMemo(
    () =>
      saveLoading
        ? I18n.t('bot_autosave_saving')
        : I18n.t('workflow_detail_title_testrun'),
    [saveLoading],
  );
  // It is running and has an execution id to cancel.
  return running ? (
    <Button
      icon={<IconCozStopCircle />}
      onClick={cancelTestRun}
      disabled={canceling || (!executeId && disabled)}
      color="primary"
    >
      {I18n.t('devops_publish_changelog_generate_stop')}
    </Button>
  ) : (
    <Button
      disabled={disabled}
      loading={loading}
      icon={<IconCozPlayFill />}
      color="green"
      onClick={onClick}
    >
      {text}
    </Button>
  );
};
export const TestRunNodeButton: React.FC<{
  node: FlowNodeEntity;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ node, onClick }) => {
  const { loading, disabled, isMineRunning } = useTestRunStatus(node.id);
  const { cancelTestRun, canceling } = useCancelTestRun();
  const {
    config: { executeId },
  } = useExecStateEntity();

  return isMineRunning ? (
    <Button
      icon={<IconCozStopCircle />}
      onClick={cancelTestRun}
      disabled={canceling || (!executeId && disabled)}
      color="primary"
      style={{ width: '100%' }}
    >
      {I18n.t('devops_publish_changelog_generate_stop')}
    </Button>
  ) : (
    <Button
      icon={<IconCozPlayFill />}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      color="green"
      style={{ width: '100%' }}
    >
      {I18n.t('workflow_debug_run')}
    </Button>
  );
};

export const TestFormSheetFooterV2: React.FC<TestFormSheetFooterV2Props> = ({
  node,
  onClick,
}) => (
  <div className={styles['test-form-sheet-footer-v2']}>
    {node ? (
      <TestRunNodeButton node={node} onClick={onClick} />
    ) : (
      <TestRunFlowButton onClick={onClick} />
    )}
  </div>
);
