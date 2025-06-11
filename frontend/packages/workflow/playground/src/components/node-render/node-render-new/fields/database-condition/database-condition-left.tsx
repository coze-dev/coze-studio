import { type DatabaseConditionLeft } from '@coze-workflow/base';

import { ConditionTag } from '../../components/condition';

export function DatabaseConditionLeftComponent({
  value,
}: {
  value?: DatabaseConditionLeft;
}) {
  if (!value) {
    return null;
  }

  return <ConditionTag>{value}</ConditionTag>;
}
