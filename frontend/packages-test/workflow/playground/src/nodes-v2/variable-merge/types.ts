import { type ValueExpression } from '@coze-workflow/base';

export interface MergeGroup {
  name: string;
  variables: ValueExpression[];
}

export interface VariableMergeFormData {
  inputs: {
    mergeGroups: MergeGroup[];
  };
}
