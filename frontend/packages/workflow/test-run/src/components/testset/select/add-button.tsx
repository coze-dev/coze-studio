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
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button, Toast } from '@coze-arch/coze-design';

import { useTestsetManageStore } from '../use-testset-manage-store';

interface TestsetAddButtonProps {
  onOpenEditPanel: () => void;
}

export const TestsetAddButton: React.FC<TestsetAddButtonProps> = ({
  onOpenEditPanel,
}) => {
  const { validateSchema, openEditPanel } = useTestsetManageStore(store => ({
    validateSchema: store.validateSchema,
    openEditPanel: store.openEditPanel,
  }));

  const handleAdd = useCallback(async () => {
    const res = await validateSchema();
    if (res !== 'ok') {
      Toast.error({
        content:
          res === 'empty'
            ? I18n.t('workflow_testset_peedit')
            : I18n.t('workflow_test_nodeerror'),
        showClose: false,
      });
      return;
    }
    openEditPanel();
    onOpenEditPanel();
  }, [onOpenEditPanel, openEditPanel, validateSchema]);

  return (
    <Button
      icon={<IconCozPlus />}
      color="highlight"
      size="small"
      style={{ width: '100%' }}
      onClick={handleAdd}
    >
      {I18n.t('workflow_testset_create_btn')}
    </Button>
  );
};
