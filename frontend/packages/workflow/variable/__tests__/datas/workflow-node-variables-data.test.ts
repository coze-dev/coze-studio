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
  WorkflowNodeInputVariablesData,
  WorkflowNodeOutputVariablesData,
  WorkflowNodeRefVariablesData,
} from 'src';
import { loopJSON } from '__tests__/workflow.mock';
import { createContainer } from '__tests__/create-container';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

describe('test workflow node variables entity data', () => {
  let workflowDocument: WorkflowDocument;

  beforeEach(async () => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);

    await workflowDocument.fromJSON(loopJSON);
  });

  test('test workflow-node-input-variables-data', () => {
    const nodes = workflowDocument.getAllNodes();

    expect(
      nodes.map(_node => {
        const data = _node.getData(WorkflowNodeInputVariablesData);

        return [
          _node.id,
          data.inputParameters,
          data.inputVariables.map(_input => _input.refVariable?.viewType),
        ];
      }),
    ).toMatchSnapshot();
  });

  test('test workflow-node-output-variables-data', () => {
    const nodes = workflowDocument.getAllNodes();

    expect(
      nodes.map(_node => {
        const data = _node.getData(WorkflowNodeOutputVariablesData);

        return [
          _node.id,
          data.variables.map(
            _variable => data.getVariableByKey(_variable.key)?.viewType,
          ),
        ];
      }),
    ).toMatchSnapshot();
  });

  test('test workflow-node-ref-variables-data', () => {
    const nodes = workflowDocument.getAllNodes();

    expect(
      nodes.map(_node => {
        const data = _node.getData(WorkflowNodeRefVariablesData);

        return [
          _node.id,
          data.refs,
          Object.values(data.refVariables).map(_ref => _ref?.viewType),
          data.hasGlobalRef,
        ];
      }),
    ).toMatchSnapshot();
  });

  test('test batchUpdateRefs', () => {
    const endNode = workflowDocument.getNode('end');

    const data = endNode?.getData(WorkflowNodeRefVariablesData);

    data?.batchUpdateRefs([
      {
        beforeKeyPath: ['llm_0'],
        afterKeyPath: ['llm_test'],
      },
      {
        beforeKeyPath: ['start', 'Object'],
        afterKeyPath: ['start', 'Drilldown', 'Object'],
      },
    ]);

    expect(data?.refs).toMatchSnapshot();
  });
});
