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
import { isNil, set } from 'lodash-es';
import { BlockInput, ViewVariableType } from '@coze-workflow/base';

export function transformOnInit(value) {
  // New drag-in node initialization
  if (!value) {
    return {
      nodeMeta: undefined,
      inputs: {
        inputParameters: {
          Query: { type: 'ref', content: '' },
        },
        datasetParameters: {
          datasetParam: [],
          datasetSetting: {},
        },
      },
      outputs: [
        {
          key: nanoid(),
          name: 'outputList',
          type: ViewVariableType.ArrayObject,
          children: [
            {
              key: nanoid(),
              name: 'output',
              type: ViewVariableType.String,
            },
          ],
        },
      ],
    };
  }

  const { inputParameters, datasetParam } = value.inputs;
  const formData = {
    ...value,
    inputs: {
      datasetParameters: {},
    },
  };

  formData.inputs.inputParameters = inputParameters.reduce(
    (map, obj: { name: string | number; input: unknown }) => {
      map[obj.name] = obj.input;
      return map;
    },
    {},
  );
  formData.inputs.datasetParameters.datasetParam = datasetParam[0]?.input.value
    .content as string[];
  // In the case of initial creation/stock data, the top_k and min_score are empty, and the initial default value is processed in the dataset-settings component
  formData.inputs.datasetParameters.datasetSetting = {
    top_k: datasetParam.find(item => item.name === 'topK')?.input.value
      .content as number,

    min_score: datasetParam.find(item => item.name === 'minScore')?.input.value
      .content as number,

    strategy: datasetParam.find(item => item.name === 'strategy')?.input.value
      .content as number,

    use_nl2sql: datasetParam.find(item => item.name === 'useNl2sql')?.input
      .value.content as boolean,
    use_rerank: datasetParam.find(item => item.name === 'useRerank')?.input
      .value.content as boolean,
    use_rewrite: datasetParam.find(item => item.name === 'useRewrite')?.input
      .value.content as boolean,
    is_personal_only: datasetParam.find(item => item.name === 'isPersonalOnly')
      ?.input.value.content as boolean,
  };

  return formData;
}

export function transformOnSubmit(value) {
  const { nodeMeta, inputs, outputs } = value;
  const { inputParameters = { Query: { type: 'ref' } }, datasetParameters } =
    inputs ?? {};
  const { datasetParam, datasetSetting } = datasetParameters ?? {};
  const actualData = {
    nodeMeta,
    outputs,
    inputs: {
      datasetParam: [] as unknown[],
    },
  };

  set(
    actualData.inputs,
    'inputParameters',
    Object.entries(inputParameters).map(([key, mapValue]) => ({
      name: key,
      input: mapValue,
    })) || [],
  );

  set(actualData.inputs, 'datasetParam', [
    {
      name: 'datasetList',
      input: {
        type: 'list',
        schema: {
          type: 'string',
        },
        value: {
          type: 'literal',
          content: datasetParam || [],
        },
      },
    },
    {
      name: 'topK',
      input: {
        type: 'integer',
        value: {
          type: 'literal',
          content: datasetSetting?.top_k,
        },
      },
    },
    BlockInput.createBoolean('useRerank', datasetSetting?.use_rerank),
    BlockInput.createBoolean('useRewrite', datasetSetting?.use_rewrite),
    BlockInput.createBoolean(
      'isPersonalOnly',
      datasetSetting?.is_personal_only,
    ),
  ]);

  // No fields are passed without a table knowledge base use_nl2sql
  if (!isNil(datasetSetting?.use_nl2sql)) {
    actualData.inputs.datasetParam.push(
      BlockInput.createBoolean('useNl2sql', datasetSetting?.use_nl2sql),
    );
  }

  // Strategy may be fulltext
  if (datasetSetting?.min_score) {
    actualData.inputs.datasetParam.push({
      name: 'minScore',
      input: {
        type: 'float',
        value: {
          type: 'literal',
          content: datasetSetting?.min_score,
        },
      },
    });
  }

  // Added search policy configuration, there may be no strategy data not in grey release
  // Strategy may be 0
  if (!isNil(datasetSetting?.strategy)) {
    actualData.inputs.datasetParam.push({
      name: 'strategy',
      input: {
        type: 'integer',
        value: {
          type: 'literal',
          content: datasetSetting?.strategy,
        },
      },
    });
  }

  return actualData;
}
