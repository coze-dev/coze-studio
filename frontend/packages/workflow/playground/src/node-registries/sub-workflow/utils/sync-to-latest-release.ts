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

import { nanoid } from 'nanoid';
import { get } from 'lodash-es';
import { ViewVariableType, variableUtils } from '@coze-workflow/variable';

function syncNodeMeta(value, workflow) {
  const { desc } = workflow;
  if (!value.nodeMeta.description) {
    value.nodeMeta.description = desc;
  }
}

function syncInputs(value, workflow) {
  const inputNames = new Set(workflow?.inputs?.map(input => input.name));

  if (value?.inputs?.inputParameters) {
    value.inputs.inputParameters = value.inputs.inputParameters.filter(input =>
      inputNames.has(input.name),
    );
  }
}

function syncHiddenFields(value, workflow) {
  const { workflow_id, end_type, space_id, inputs: inputDefs } = workflow;
  value.inputs.workflowId = workflow_id;
  value.inputs.spaceId = space_id;
  value.inputs.inputDefs = inputDefs;
  value.inputs.type = end_type;
}

function syncOutputValueKeys(currentOutputsValue, prevOutputsValue) {
  // Synchronize key output with same name to prevent reference invalidation
  currentOutputsValue.map(item => {
    const sameNameItem = prevOutputsValue.find(
      prevItem => prevItem.name === item.name,
    );
    if (sameNameItem) {
      item.key = sameNameItem.key;
      if (item.children && sameNameItem.children) {
        syncOutputValueKeys(item.children, sameNameItem.children);
      }
    }
    return item;
  });
}

function syncOutputs(value, workflow) {
  const workflowOutputs = get(workflow, 'outputs');
  const workflowOutputsExisted = !!workflowOutputs;
  const valueOutputsExisted = !!get(value, 'outputs');
  const isBatchMode = get(value, 'inputs.batch.batchEnable');

  if (!workflowOutputsExisted || workflowOutputs.length === 0) {
    /**
     * If there is no output, assign an empty array
     * Ps: cannot be assigned to undefined, the new form engine will not trigger side effects that cause the variable engine not to update
     */
    value.outputs = [];
    return;
  }

  if (!valueOutputsExisted) {
    if (isBatchMode) {
      value.outputs = [
        {
          name: 'outputList',
          type: ViewVariableType.ArrayObject,
          key: nanoid(),
          children: [],
        },
      ];
    } else {
      value.outputs = [];
    }
  }

  const { outputs } = workflow;
  const outputsValue = outputs.map(variableUtils.dtoMetaToViewMeta);

  // If exception handling is enabled, you need to put the errorbody back together
  const errorIgnoreIsOpen = get(value, 'inputs.settingOnError.switch');
  if (errorIgnoreIsOpen) {
    let errorBody = get(value, 'outputs')?.find(
      item => item.name === 'errorBody',
    );

    if (isBatchMode) {
      errorBody = get(value, 'outputs[0].children')?.find(
        item => item.name === 'errorBody',
      );
    }
    if (errorBody) {
      outputsValue.push(errorBody);
    }
  }

  const prevOutputsValue = isBatchMode
    ? value.outputs[0].children
    : value.outputs;

  if (prevOutputsValue) {
    syncOutputValueKeys(outputsValue, prevOutputsValue);
  }

  if (isBatchMode) {
    value.outputs[0].children = outputsValue;
  } else {
    value.outputs = outputsValue;
  }
}

export function syncToLatestReleaseState(value, workflow) {
  syncNodeMeta(value, workflow);
  syncInputs(value, workflow);
  syncHiddenFields(value, workflow);
  syncOutputs(value, workflow);
}
