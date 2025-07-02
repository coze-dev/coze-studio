import { get } from 'lodash-es';
import {
  useWorkflowNode,
  type DatabaseCondition,
  type ConditionLogic,
} from '@coze-workflow/base';

export function useConditions(conditionFieldName: string) {
  const { data } = useWorkflowNode();
  const value: { conditionList?: DatabaseCondition[]; logic?: ConditionLogic } =
    get(data, conditionFieldName, []);
  return value;
}
