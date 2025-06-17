import { type FC } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useConditionContext } from './context';

interface ConditionHeaderProps {
  onAdd: () => void;
}

export const ConditionHeader: FC<ConditionHeaderProps> = props => {
  const { readonly, setterPath } = useConditionContext();
  const { concatTestId } = useNodeTestId();

  const { onAdd } = props;
  return (
    <div className="flex justify-between items-center mb-2 cursor-pointer">
      <div className="font-semibold">
        {I18n.t('worklfow_condition_condition_branch', {}, 'Condition branch')}
      </div>
      <IconButton
        size="small"
        disabled={readonly}
        onClick={readonly ? () => null : onAdd}
        color="highlight"
        icon={<IconCozPlus className="text-sm" />}
        data-testid={concatTestId(setterPath, 'branch', 'add')}
      />
    </div>
  );
};
