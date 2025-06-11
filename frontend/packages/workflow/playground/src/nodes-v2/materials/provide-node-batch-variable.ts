import { get } from 'lodash-es';
import {
  FlowNodeVariableData,
  ASTKind,
  type Effect,
  DataEvent,
} from '@flowgram-adapter/free-layout-editor';
import { parseNodeBatchByInputList } from '@coze-workflow/variable';
function createEffect(
  batchModePath: string,
  batchInputListPath: string,
): Effect {
  return ({ formValues, context }) => {
    const batchMode = get(formValues, batchModePath);
    const batch = get(formValues, batchInputListPath);

    const { node } = context || {};

    if (!node) {
      return;
    }

    const variableData: FlowNodeVariableData =
      node.getData(FlowNodeVariableData);

    if (!variableData.private) {
      variableData.initPrivate();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scope = variableData.private!;

    const declarations =
      batchMode === 'batch' ? parseNodeBatchByInputList(node.id, batch) : [];
    scope.ast.set('/node/locals', {
      kind: ASTKind.VariableDeclarationList,
      declarations,
    });
  };
}

export function createProvideNodeBatchVariables(
  batchModePath: string,
  batchInputListPath: string,
) {
  return [
    {
      effect: createEffect(batchModePath, batchInputListPath),
      event: DataEvent.onValueChange,
    },
    {
      effect: createEffect(batchModePath, batchInputListPath),
      event: DataEvent.onValueInit,
    },
  ];
}
