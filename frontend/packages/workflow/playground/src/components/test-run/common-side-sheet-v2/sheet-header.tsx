import { useCallback } from 'react';

import { IconButton } from '@coze-arch/coze-design';
import { IconCozeCross } from '@coze-arch/bot-icons';

import { useTestFormState } from '@/hooks';

import styles from './styles.module.less';

export const CommonSideSheetHeaderV2: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const testFormState = useTestFormState();

  const handleClose = useCallback(() => {
    testFormState.closeCommonSheet();
  }, [testFormState]);

  return (
    <div className={styles['common-side-sheet-header']}>
      <div className={styles['sheet-header-title']}>{children}</div>
      <IconButton
        icon={<IconCozeCross />}
        color="secondary"
        onClick={handleClose}
      />
    </div>
  );
};
