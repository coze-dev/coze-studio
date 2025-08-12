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
import { set } from 'lodash-es';
import { ViewVariableType } from '@coze-workflow/base';

import type { DatasetNodeActualData, DatasetNodeFormData } from './type';

const TEST_RUN_FILE_NAME_KEY = 'x-wf-file_name';

export function transformOnInit(
  value: DatasetNodeActualData,
): DatasetNodeFormData {
  // New drag-in node initialization
  if (!value) {
    return {
      nodeMeta: undefined,
      inputs: {
        inputParameters: {
          knowledge: { type: 'ref' },
        },
        datasetParameters: {
          datasetParam: [],
          datasetSetting: {
            top_k: 1,
            min_score: 0,
            strategy: 0,
          },
        },
        datasetWriteParameters: undefined,
      },
      outputs: [
        {
          key: nanoid(),
          name: 'documentId',
          type: ViewVariableType.String,
        },
        {
          key: nanoid(),
          name: 'fileName',
          type: ViewVariableType.String,
        },
        {
          key: nanoid(),
          name: 'fileUrl',
          type: ViewVariableType.String,
        },
      ],
    };
  }

  const { inputParameters, datasetParam, strategyParam } = value.inputs;
  const formData = {
    ...value,
  };

  set(
    formData,
    'inputs.inputParameters',
    inputParameters.reduce(
      (map, obj: { name: string | number; input: unknown }) => {
        map[obj.name] = obj.input;
        return map;
      },
      {},
    ),
  );

  set(
    formData,
    'inputs.datasetParameters.datasetParam',
    datasetParam[0]?.input.value.content,
  );

  set(formData, 'inputs.datasetWriteParameters', {
    ...strategyParam,
    indexStrategy: {
      ...strategyParam.indexStrategy,
      vectorModel: {
        name: strategyParam.indexStrategy.vectorModel,
      },
    },
  });

  return formData as unknown as DatasetNodeFormData;
}

interface FileUrlProps {
  type: string;
  content?: string | number | boolean | unknown[];
  rawMeta?: {
    fileName: string;
    type: number;
  };
}

const getFormatFileUrl = (inputValue: FileUrlProps) => {
  const originUrl = inputValue?.content ?? '';
  const fileName = inputValue?.rawMeta?.fileName ?? '';
  try {
    const urlObj = new URL(originUrl as string);
    const params = new URLSearchParams(urlObj.search);

    if (params.has(TEST_RUN_FILE_NAME_KEY)) {
      params.set(TEST_RUN_FILE_NAME_KEY, fileName);
    } else {
      params.append(TEST_RUN_FILE_NAME_KEY, fileName);
    }

    urlObj.search = params.toString();

    return urlObj.toString();
  } catch (e) {
    return originUrl;
  }
};

export function transformOnSubmit(
  value: DatasetNodeFormData,
): DatasetNodeActualData {
  const { nodeMeta, inputs, outputs } = value;
  const {
    inputParameters = { knowledge: { type: 'ref' } },
    datasetParameters,
    datasetWriteParameters,
  } = inputs ?? {};
  const { datasetParam } = datasetParameters ?? {};
  const actualData = { nodeMeta, outputs, inputs: {} };

  const nextInputParameters =
    Object.entries(inputParameters).map(([key, mapValue]) => ({
      name: key,
      input: mapValue as FileUrlProps,
    })) || [];

  if (
    nextInputParameters?.[0]?.input?.type !== 'ref' &&
    nextInputParameters?.[0]?.input?.content
  ) {
    nextInputParameters[0].input.content = getFormatFileUrl(
      nextInputParameters[0].input,
    );
  }

  set(actualData.inputs, 'inputParameters', nextInputParameters);

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
  ]);

  set(actualData.inputs, 'strategyParam', {
    parsingStrategy: datasetWriteParameters?.parsingStrategy,
    chunkStrategy: datasetWriteParameters?.chunkStrategy,
    indexStrategy: {
      ...datasetWriteParameters?.indexStrategy,
      vectorModel: datasetWriteParameters?.indexStrategy?.vectorModel?.name,
    },
  });

  return actualData as DatasetNodeActualData;
}
