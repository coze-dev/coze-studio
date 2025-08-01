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
