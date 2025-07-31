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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React from 'react';

import classNames from 'classnames';
import { WorkflowExeStatus } from '@coze-workflow/base/api';
import { WorkflowExecStatus } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozLoading,
  IconCozWarningCircleFill,
} from '@coze-arch/coze-design/icons';
import { Divider } from '@coze-arch/coze-design';
import {
  IconWorkflowRunSuccess,
  IconWorkflowRunFail,
} from '@coze-arch/bot-icons';

import { useHasError } from '../hooks/use-has-error';
import { TestRunCostPopover } from '../../test-run-cost-popover';
import { COLOR_STYLE_MAP } from '../../../../workflow-header/constants';
import { useTestRun } from '../../../../../hooks/use-test-run';
import { useGlobalState, useExecStateEntity } from '../../../../../hooks';

import styles from './index.module.less';

const loadingStyle = {
  backgroundColor: 'var(--light-color-cyan-cyan-1,#c5f3f6)',
  color: '#0195ad',
};

const commonClassNames = classNames(
  'flex items-center',
  'h-5',
  'w-fit',
  'rounded-medium',
  'px-2 py-[2px]',
  'font-medium',
  'text-[12px]',
);

interface Props {
  hiddenStateText?: boolean;
  extra?: React.ReactNode;
  onClick?: () => void;
}

export const ExecuteState = ({ hiddenStateText, extra, onClick }: Props) => {
  const { viewStatus } = useGlobalState();

  const execEntity = useExecStateEntity();
  const {
    executeStatus,
    tokenAndCost = {},
    workflowExeCost,
  } = execEntity.config;

  const { hasNodeResult } = execEntity;

  const { isCanceled } = useTestRun();

  // Containing warnings is still considered successful
  const hasError = useHasError({
    withWarning: false,
  });

  const loading =
    viewStatus === WorkflowExecStatus.EXECUTING ||
    executeStatus === WorkflowExeStatus.Running;

  // That is, there is no running result, and there is no verification error, indicating that it has not been run and has no running state.
  if (!hasNodeResult && !hasError && !loading) {
    return extra ? (
      <span
        className={'flex items-center text-[14px] pl-8px pr-8px'}
        onClick={onClick}
      >
        {extra}
      </span>
    ) : null;
  }

  const isSuccess = executeStatus === WorkflowExeStatus.Success && !hasError;

  const getStyle = () => {
    if (loading) {
      return loadingStyle;
    }
    if (isCanceled) {
      return COLOR_STYLE_MAP.Tertiary;
    }
    if (isSuccess) {
      return COLOR_STYLE_MAP.Success;
    }
    return COLOR_STYLE_MAP.Danger;
  };

  const style = getStyle();

  const TokenCost = () => (
    <div className="cursor-pointer max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
      {tokenAndCost.totalTokens ?? '-'}
    </div>
  );

  const ExecuteStatus = () => {
    const StatusIcon = () => {
      if (loading) {
        return <IconCozLoading className="animate-spin mr-1  text-[#0195AD]" />;
      }
      if (isCanceled) {
        return <IconCozWarningCircleFill />;
      }
      if (isSuccess) {
        return <IconWorkflowRunSuccess className={styles['success-icon']} />;
      }
      return <IconWorkflowRunFail />;
    };

    const statusText = (() => {
      if (loading) {
        if (hiddenStateText) {
          return workflowExeCost;
        }

        return `${I18n.t(
          'workflow_detail_title_testrun_running',
        )} ${workflowExeCost}`;
      }
      if (isCanceled) {
        if (hiddenStateText) {
          return '0.000s';
        }
        return I18n.t('workflow_node_stoprun');
      }
      if (!hasNodeResult) {
        if (hiddenStateText) {
          return '0.000s';
        }
        return I18n.t('worklfow_without_run');
      }
      if (isSuccess) {
        if (hiddenStateText) {
          return workflowExeCost;
        }
        return `${I18n.t(
          'workflow_detail_title_testrun_finished',
        )} ${workflowExeCost}`;
      }
      return I18n.t('workflow_running_results_run_failed');
    })();

    return (
      <>
        <StatusIcon />
        <span className="ml-2">{statusText}</span>
      </>
    );
  };

  if (!hasNodeResult) {
    return (
      <div className={commonClassNames} style={style} onClick={onClick}>
        {<ExecuteStatus />}
      </div>
    );
  }

  return (
    <TestRunCostPopover tokenAndCost={tokenAndCost}>
      <div className="w-full" onClick={onClick}>
        <div className={commonClassNames} style={style}>
          {<ExecuteStatus />}

          <div
            className={classNames('h-3 w-[1px]', 'mx-1')}
            style={{ backgroundColor: style.color }}
          />

          <TokenCost />

          {extra ? (
            <>
              <Divider layout="vertical" margin={'4px'} />
              <span className={'flex items-center text-[12px]'}>{extra}</span>
            </>
          ) : null}
        </div>
      </div>
    </TestRunCostPopover>
  );
};
