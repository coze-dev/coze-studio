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
