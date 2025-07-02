import { useResetCondition } from '@/node-registries/database/common/hooks';
import { useForm } from '@/form';
import {
  queryFieldsFieldName,
  orderByFieldName,
  queryLimitFieldName,
  queryConditionFieldName,
} from '@/constants/database-field-names';

export function useResetFields() {
  const form = useForm();
  const resetCondition = useResetCondition(queryConditionFieldName);

  const resetQueryFields = () => {
    form.setFieldValue(queryFieldsFieldName, undefined);
  };

  const resetOrderBy = () => {
    form.setFieldValue(orderByFieldName, undefined);
  };

  const resetQueryLimit = () => {
    form.setFieldValue(queryLimitFieldName, undefined);
  };

  return () => {
    resetCondition();
    resetQueryFields();
    resetOrderBy();
    resetQueryLimit();
  };
}
