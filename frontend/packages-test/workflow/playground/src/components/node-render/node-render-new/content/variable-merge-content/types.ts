import { type VariableTagProps } from '../../fields/variable-tag-list';

export interface VariableMergeGroup extends VariableTagProps {
  name: string;
  variableTags: VariableTagProps[];
}
