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
 
import { useCallback } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { useOpenTraceListPanel } from '@/hooks';
import { useTestRunStatus } from '@/components/test-run/hooks/use-test-run-status';
import { START_NODE_ID } from '@/components/test-run/constants';

import { ExecuteState } from '../execute-result/execute-result-side-sheet/components/execute-state';

import styles from './styles.module.less';

export const TestFormSheetHeaderV2 = () => {
  const { running } = useTestRunStatus(START_NODE_ID);

  const floatLayoutService = useFloatLayoutService();

  const { open } = useOpenTraceListPanel();

  const handleOpenTraceBottomSheet = useCallback(() => {
    // The community version does not currently support trace, for future expansion
    if (IS_OPEN_SOURCE) {
      return;
    }
    open();
  }, [open]);

  const handleClose = useCallback(() => {
    floatLayoutService.close('right');
  }, [floatLayoutService]);

  return (
    <div className={styles['test-form-sheet-header-v2']}>
      <div className={cls(styles['header-title-v2'])}>
        {I18n.t('workflow_detail_title_testrun')}
      </div>

      <div className="flex items-center">
        {!running && (
          <ExecuteState
            onClick={handleOpenTraceBottomSheet}
            hiddenStateText
            extra={
              // The community version does not currently support trace, for future expansion
              !IS_OPEN_SOURCE && (
                <span className={cls('cursor-pointer font-medium')}>
                  {I18n.t('workflow_testset_view_log')}
                </span>
              )
            }
          />
        )}
        <IconButton
          className={'ml-[4px]'}
          icon={<IconCozCross className={'text-[18px]'} />}
          color="secondary"
          onClick={handleClose}
        />
      </div>
    </div>
  );
};
