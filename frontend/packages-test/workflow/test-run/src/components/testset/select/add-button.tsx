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
