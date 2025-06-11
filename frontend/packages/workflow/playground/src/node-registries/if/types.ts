import { type ConditionValue } from '@/form-extensions/setters/condition/multi-condition/types';

export interface FormData {
  inputs?: {
    branches?: ConditionValue;
  };
  condition: ConditionValue;
}
