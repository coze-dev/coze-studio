import { useCallback } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';

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
              <span className={cls('cursor-pointer font-medium')}>
                {I18n.t('workflow_testset_view_log')}
              </span>
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
