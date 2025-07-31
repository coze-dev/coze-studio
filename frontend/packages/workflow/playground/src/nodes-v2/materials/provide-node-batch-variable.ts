/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
