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

import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { useOpenTraceListPanel } from '@/hooks';

import { ExecuteState } from '../execute-result/execute-result-side-sheet/components/execute-state';

import styles from './test-form-header.module.less';

export const TestFormHeader: React.FC = () => {
  const floatLayoutService = useFloatLayoutService();

  const { open } = useOpenTraceListPanel();

  const handleOpenTraceBottomSheet = useCallback(() => {
    // will support soon
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
      <div className={styles['header-title-v2']}>
        {I18n.t('workflow_detail_title_testrun')}
      </div>

      <div className="flex gap-x-1 items-center">
        <ExecuteState
          hiddenStateText
          onClick={handleOpenTraceBottomSheet}
          extra={
            // will support soon
            !IS_OPEN_SOURCE && (
              <span className={'cursor-pointer font-medium'}>
                {I18n.t('workflow_testset_view_log')}
              </span>
            )
          }
        />
        <IconButton
          icon={<IconCozCross className={'text-[18px]'} />}
          color="secondary"
          onClick={handleClose}
        />
      </div>
    </div>
  );
};
