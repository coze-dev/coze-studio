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

import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import cls from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  TestsetSelect,
  type TestsetSelectProps,
  type TestsetSelectAPI,
  useTestsetManageStore,
} from '@coze-workflow/test-run';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base';
import { type CaseDataDetail } from '@coze-arch/idl/debugger_api';
import { I18n } from '@coze-arch/i18n';
import { debuggerApi } from '@coze-arch/bot-api';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Divider, Tooltip } from '@coze-arch/coze-design';

import {
  TestRunState,
  WorkflowRunService,
} from '@/services/workflow-run-service';
import { useGlobalState } from '@/hooks';

import styles from './index.module.less';

interface Props {
  onSelectTestSet: TestsetSelectProps['onSelect'];
  currentCase?: CaseDataDetail;
  disabled?: boolean;
  isNewForm?: boolean;
}

export default forwardRef<TestsetSelectAPI | null, Props>(
  function TestSetSelectField(
    { onSelectTestSet, currentCase, disabled, isNewForm },
    ref,
  ) {
    const baseSelectRef = useRef<TestsetSelectAPI>(null);
    const { spaceId, config } = useGlobalState();
    const runService = useService<WorkflowRunService>(WorkflowRunService);
    const [show, setShow] = useState(false);
    const { bizComponentSubject, bizCtx, openEditPanel } =
      useTestsetManageStore(store => store);

    useEffect(() => {
      debuggerApi
        .MGetCaseData({
          bizCtx,
          bizComponentSubject,
          caseName: undefined,
          pageLimit: 10,
        })
        .then(res => {
          const flag = !!res?.cases?.length;
          setShow(flag);

          // You need to wait for the TestsetSelect component to render first.
          setTimeout(() => {
            if (flag && currentCase?.caseBase?.caseID) {
              baseSelectRef.current?.set?.(currentCase);
            }
          }, 100);
        })
        .catch(() => {
          setShow(false);
        });
    }, [currentCase?.caseBase?.caseID]);

    const isRunning =
      runService.testRunState === TestRunState.Executing ||
      runService.testRunState === TestRunState.Paused;

    useImperativeHandle(ref, () => ({
      clear: baseSelectRef.current?.clear,
      openEditPanel,
    }));

    if (spaceId === PUBLIC_SPACE_ID || !show) {
      return null;
    }

    return (
      <div className={cls(isNewForm && 'pl-[16px] pr-[16px] pt-[8px]')}>
        <div className={'flex items-center mb-[4px]'}>
          <span className={'coz-fg-primary text-[12px] font-bold'}>
            {I18n.t('workflow_testset_available')}
          </span>
          <Tooltip content={I18n.t('workflow_testset_hover_tips')}>
            <IconCozInfoCircle className="ml-[4px] text-base coz-fg-secondary !text-[14px]" />
          </Tooltip>
        </div>

        <TestsetSelect
          className={styles['test-set-select-field']}
          dropdownClassName={styles['test-set-select-dropdown']}
          ref={baseSelectRef}
          onSelect={onSelectTestSet}
          disabled={config.preview || isRunning || disabled}
        />

        <Divider
          className={cls('mt-[12px]', isNewForm ? 'mb-0' : 'mb-[12px]')}
        />
      </div>
    );
  },
);
