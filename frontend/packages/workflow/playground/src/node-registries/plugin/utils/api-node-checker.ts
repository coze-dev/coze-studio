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
import { keyBy, set, sortBy, cloneDeep } from 'lodash-es';
import { variableUtils } from '@coze-workflow/variable';
import {
  ERROR_BODY_NAME,
  IS_SUCCESS_NAME,
  type ApiNodeDetailDTO,
} from '@coze-workflow/nodes';
import {
  BatchMode,
  BlockInput,
  ViewVariableType,
  type InputValueVO,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';

import { type ApiNodeDTODataWhenOnInit } from '../types';

/**
 * Check if plug-in outputs have changed
 * @param prevOutputs
 * @param nextOutputs
 * @returns boolean
 */
export function isApiOutputsChanged(
  prevOutputs: ViewVariableTreeNode[] | undefined,
  nextOutputs: ViewVariableTreeNode[] | undefined,
) {
  if (!prevOutputs && !nextOutputs) {
    return false;
  }

  if ((prevOutputs || []).length !== (nextOutputs || []).length) {
    return true;
  }

  const sortedPrevOutputs = sortBy(prevOutputs, 'name');
  const sortedNextOutputs = sortBy(nextOutputs, 'name');

  let isChanged = false;

  for (let i = 0; i < sortedPrevOutputs.length; i++) {
    const prevOutput = sortedPrevOutputs[i];
    const nextOutput = sortedNextOutputs[i];

    if (
      prevOutput.name !== nextOutput.name ||
      prevOutput.type !== nextOutput.type
    ) {
      isChanged = true;
    } else {
      isChanged = isApiOutputsChanged(prevOutput.children, nextOutput.children);
    }

    if (isChanged) {
      break;
    }
  }

  return isChanged;
}

/**
 * Verify whether the plugin has changed. If there is a change, return true, otherwise return false.
 * @param params api basic parameter list
 * @param inputParameters imported parameters
 * @param apiNodeDetail plugin latest value
 * @returns
 */
export function checkPluginUpdated({
  params,
  inputParameters,
  outputs,
  apiNodeDetail,
  isBatchMode,
}: {
  params: BlockInput[];
  inputParameters: InputValueVO[];
  outputs: ViewVariableTreeNode[]; // The outputs parameter has been converted to the front-end variable format
  isBatchMode: boolean;
  apiNodeDetail: ApiNodeDetailDTO;
}): boolean {
  const oldApiNameParam = params?.find(
    (item: BlockInput) => item.name === 'apiName',
  );
  const oldApiName = oldApiNameParam
    ? BlockInput.toLiteral(oldApiNameParam)
    : '';
  const isApiNameChanged = oldApiName !== apiNodeDetail.apiName;

  // The name of the required parameter that is actually saved (if the optional parameter is filled in, it will also be included)
  const oldParamNames = (inputParameters || []).map(v => v.name);

  // API-defined parameter names
  const newParamNames = (apiNodeDetail.inputs || [])?.map(v => v.name);

  // Imported parameter detection currently only detects deleted parameter scenes, and incremental scenes are temporarily difficult to detect
  const isInputParamsChanged = !oldParamNames.every(paramName =>
    newParamNames.includes(paramName || ''),
  );

  const isOutputsChanged = isApiOutputsChanged(
    // In batch mode, the outermost layer of the variable will wrap an outputList variable
    // Therefore, if it is batch mode, it is necessary to compare the children of the outputList here.
    isBatchMode ? outputs?.[0]?.children : outputs,
    // API output parameters need to be converted into front-end variable format
    (apiNodeDetail.outputs || []).map(variableUtils.dtoMetaToViewMeta),
  );

  return isApiNameChanged || isInputParamsChanged || isOutputsChanged;
}

/**
 * Update the values of apiParam related parameters
 * @param apiParams
 * @param paramName
 * @param updateValue
 */
function updateApiParamValue(
  apiParams: BlockInput[],
  paramName: string,
  updateValue: string,
) {
  const apiNameParam = (apiParams || [])?.find(
    (item: BlockInput) => item.name === paramName,
  );

  if (apiNameParam) {
    set(apiNameParam, 'input.value.content', updateValue);
  }
}

/**
 * Synchronize plug-in input parameters
 * @param draft current form
 * @Param inputs plugin latest input parameters
 */
function syncInputParameters(
  draft: ApiNodeDTODataWhenOnInit,
  inputs: ApiNodeDetailDTO['inputs'],
) {
  // Update imported parameters, mainly remove redundant parameters
  if (draft?.inputs?.inputParameters) {
    // Get the latest parameter definitions
    const paramMap = keyBy(inputs, 'name');

    // Only those that exist in the parameter definition are preserved
    draft.inputs.inputParameters = draft?.inputs?.inputParameters.filter(
      param => paramMap[param.name || ''],
    );
  }
}

/**
 * Synchronization plug-in output parameters
 * @param draft current form
 * @Param outputs plugin latest output parameters
 */
function syncOutputs(
  draft: ApiNodeDTODataWhenOnInit,
  outputs: ApiNodeDetailDTO['outputs'],
) {
  const isBatchMode = Boolean(draft.inputs?.batch?.batchEnable);

  // In batch mode, the outermost layer of the variable will wrap an outputList variable
  // Therefore, if it is batch mode, it is necessary to compare the children of the outputList here.
  const originOutputs = isBatchMode
    ? draft.outputs?.[0]?.children
    : draft.outputs;

  const isOutputChanged = isApiOutputsChanged(
    (originOutputs || []).filter(
      v => ![ERROR_BODY_NAME, IS_SUCCESS_NAME].includes(v.name),
    ),
    outputs?.map(variableUtils.dtoMetaToViewMeta),
  );

  if (isOutputChanged) {
    // Synchronized exported parameters
    if (outputs) {
      const outputVal = outputs.map(variableUtils.dtoMetaToViewMeta);

      // Batch mode, regenerate it (reference: packages/workflow/variable/src/legacy/workflow-batch-service)
      if (isBatchMode) {
        draft.outputs = [
          {
            key: nanoid(),
            type: ViewVariableType.ArrayObject,
            name: variableUtils.DEFAULT_OUTPUT_NAME[BatchMode.Batch],
            children: outputVal,
          },
        ];
      } else {
        draft.outputs = outputVal;
      }
    } else {
      // There are no exported parameters, you need to delete the original exported parameters.
      draft.outputs = [];
    }
  }
}

/**
 * If there is an update to the plugin, then synchronize the latest value of the plugin
 * @param value current form
 * @param apiNodeDetail plugin latest value
 * @Returns the updated form
 */
export function syncToLatestValue(
  value: ApiNodeDTODataWhenOnInit,
  apiNodeDetail: ApiNodeDetailDTO,
) {
  const { apiName, updateTime, inputs, outputs } = apiNodeDetail;
  const draft = cloneDeep(value);
  const apiParams = draft?.inputs?.apiParam || [];
  updateApiParamValue(apiParams, 'apiName', apiName);
  updateApiParamValue(apiParams, 'updateTime', updateTime as string);

  syncInputParameters(draft, inputs);
  syncOutputs(draft, outputs);

  return draft;
}
