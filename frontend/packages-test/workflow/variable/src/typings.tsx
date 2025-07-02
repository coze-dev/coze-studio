import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType } from '@coze-workflow/base';

export {
  ValueExpressionType,
  ViewVariableType,
  type ViewVariableMeta,
  type ViewVariableTreeNode,
  type ValueExpression,
  type ValueExpressionDTO,
  type RefExpression,
} from '@coze-workflow/base';

export type VariableProviderParser = VariableProviderAbilityOptions['parse'];

export interface TypeDefinition {
  type: ViewVariableType;
}
