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
            <span className={'cursor-pointer font-medium'}>
              {I18n.t('workflow_testset_view_log')}
            </span>
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
