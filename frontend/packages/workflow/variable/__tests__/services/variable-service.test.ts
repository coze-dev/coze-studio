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

import { WorkflowVariableService } from 'src';
import { loopJSON } from '__tests__/workflow.mock';
import { allKeyPaths } from '__tests__/variable.mock';
import { createContainer } from '__tests__/create-container';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

describe('test variable service', () => {
  let workflowDocument: WorkflowDocument;
  let variableService: WorkflowVariableService;

  beforeEach(async () => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    variableService = container.get<WorkflowVariableService>(
      WorkflowVariableService,
    );

    await workflowDocument.fromJSON(loopJSON);
  });

  test('test get variable', () => {
    expect(
      allKeyPaths.map(_case => {
        const workflowVariable = variableService.getWorkflowVariableByKeyPath(
          _case,
          {},
        );

        if (!workflowVariable) {
          return [variableService.getViewVariableByKeyPath(_case, {})];
        }

        return [
          variableService.getViewVariableByKeyPath(_case, {}),
          workflowVariable.viewType,
          workflowVariable.renderType,
          workflowVariable.dtoMeta,
          workflowVariable.refExpressionDTO,
          workflowVariable.key,
          workflowVariable.parentVariables.map(_field => _field.key),
          workflowVariable.children.map(_field => _field.key),
          workflowVariable.expressionPath,
          workflowVariable.groupInfo,
          workflowVariable.node.id,
        ];
      }),
    ).toMatchSnapshot();
  });
});
