import { type DatabaseCondition, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { useFieldArray } from '@/form';

export function ConditionAddButton() {
  const { append, readonly } = useFieldArray<DatabaseCondition>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <Button
      disabled={readonly}
      className="mt-[4px]"
      onClick={() =>
        append({ left: undefined, operator: undefined, right: undefined })
      }
      icon={<IconCozPlus />}
      size="small"
      color="highlight"
      data-testid={getNodeSetterId('condition-add-button')}
    >
      {I18n.t('workflow_add_condition')}
    </Button>
  );
}
