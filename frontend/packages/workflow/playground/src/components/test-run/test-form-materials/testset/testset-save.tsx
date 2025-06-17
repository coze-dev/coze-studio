import { useTestsetManageStore } from '@coze-workflow/test-run';
import { I18n } from '@coze-arch/i18n';
import { Checkbox, Typography } from '@coze-arch/coze-design';

import css from './testset-save.module.less';

interface TestsetSaveProps {
  value?: boolean;
  onChange: (v?: boolean) => void;
  onBlur: () => void;
}

export const TestsetSave: React.FC<TestsetSaveProps> = ({
  value,
  onChange,
  onBlur,
  ...props
}) => {
  const { openEditPanel } = useTestsetManageStore(store => ({
    openEditPanel: store.openEditPanel,
  }));
  const handleChange = e => {
    onChange?.(e.target.checked);
    onBlur?.();
  };

  return (
    <div className={css['testset-save']}>
      <Checkbox checked={value} onChange={handleChange} {...props}>
        <Typography.Text size="small">
          {I18n.t('workflow_testset_save')}
        </Typography.Text>
        <Typography.Text
          link
          size="small"
          style={{
            lineHeight: '20px',
          }}
          onClick={e => {
            e.stopPropagation();
            openEditPanel();
          }}
        >
          {I18n.t('workflow_testset_create')}
        </Typography.Text>
      </Checkbox>
    </div>
  );
};
