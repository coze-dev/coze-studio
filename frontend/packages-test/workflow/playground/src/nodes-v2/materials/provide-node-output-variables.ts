import {
  FlowNodeVariableData,
  ASTKind,
  type Effect,
  DataEvent,
} from '@flowgram-adapter/free-layout-editor';
import { parseNodeOutputByViewVariableMeta } from '@coze-workflow/variable';
function createEffect(): Effect {
  return ({ value, context }) => {
    if (!context) {
      return;
    }
    const { node } = context;
    const variableData: FlowNodeVariableData =
      node.getData(FlowNodeVariableData);
    const scope = variableData.public;
    const declarations = parseNodeOutputByViewVariableMeta(node.id, value);

    scope.ast.set('/node/outputs', {
      kind: ASTKind.VariableDeclarationList,
      declarations,
    });
  };
}

export const provideNodeOutputVariablesEffect = [
  {
    effect: createEffect(),
    event: DataEvent.onValueChange,
  },
  {
    effect: createEffect(),
    event: DataEvent.onValueInit,
  },
];
