import { ConditionLogic } from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';
import { useForm } from '@/form';

export function useResetCondition(conditionFieldName: string) {
  const form = useForm();
  const { data: currentDatabase } = useCurrentDatabaseQuery();

  return () => {
    // 当前有选中的数据库 需要有一个空条件
    if (currentDatabase) {
      form.setFieldValue(conditionFieldName, {
        conditionList: [
          { left: undefined, operator: undefined, right: undefined },
        ],
        logic: ConditionLogic.AND,
      });
    } else {
      form.setFieldValue(conditionFieldName, undefined);
    }
  };
}
