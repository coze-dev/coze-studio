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

import { isBoolean, isInteger, isNumber, isNil, get, set } from 'lodash-es';
import {
  type SetterOrDecoratorContext,
  type IFormItemMeta,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  type InputValueVO,
  type LiteralExpression,
  ValueExpressionType,
  BatchMode,
  type BatchDTO,
  type BatchVO,
  ViewVariableType,
  type BatchVOInputList,
  type ValueExpression,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { settingOnErrorInit, settingOnErrorSave } from '../setting-on-error';
import {
  DEFAULT_BATCH_CONCURRENT_SIZE,
  DEFAULT_BATCH_SIZE,
} from '../constants';
export namespace nodeUtils {
  export const INPUT_PARAMS_PATH = 'inputs.inputParameters';
  const BATCH_MODE_PATH = 'inputs.batchMode';
  const BATCH_PATH = 'inputs.batch';
  const SETTING_ON_ERROR_PATH = 'inputs.settingOnError';
  const NODE_SETTING_ON_ERROR_PATH = 'settingOnError';

  export type MapToArrayHandler<MapItem, ArrayItem> = (
    key: string,
    value: MapItem,
  ) => ArrayItem;
  export type ArrayToMapHandler<ArrayItem, MapItem> = (
    item: ArrayItem,
  ) => MapItem;

  export function mapToArray<
    MapItem = InputValueVO['input'],
    ArrayItem = InputValueVO,
  >(
    map: Record<string, MapItem>,
    handle: MapToArrayHandler<MapItem, ArrayItem>,
  ) {
    return Object.keys(map).map((key: string) => handle(key, map[key]));
  }

  export function arrayToMap<
    ArrayItem = InputValueVO,
    MapItem = InputValueVO['input'],
  >(
    array: ArrayItem[],
    key: keyof ArrayItem,
    handler: ArrayToMapHandler<ArrayItem, MapItem>,
  ) {
    const map: Record<string, MapItem> = {};
    array.forEach((item: ArrayItem): void => {
      map[item[key] as string] = handler(item);
    });
    return map;
  }

  export function batchToDTO(
    batchVO: BatchVO | undefined,
    nodeFormContext: any,
  ): BatchDTO | undefined {
    if (!batchVO) {
      return;
    }

    const {
      playgroundContext: { variableService },
    } = nodeFormContext;

    const {
      batchSize = DEFAULT_BATCH_SIZE,
      concurrentSize = DEFAULT_BATCH_CONCURRENT_SIZE,
      inputLists,
    } = batchVO;
    const inputListsDTO = inputLists.map(inputList => ({
      name: inputList.name,
      input: variableUtils.valueExpressionToDTO(
        inputList.input,
        variableService,
        {
          node: nodeFormContext?.node,
        },
      ),
    }));
    return {
      batchSize,
      concurrentSize,
      inputLists: inputListsDTO,
    };
  }

  export function batchToVO(
    batchDTO: BatchDTO | undefined,
    nodeFormContext: any,
  ): BatchVO | undefined {
    if (!batchDTO) {
      return;
    }
    const {
      playgroundContext: { variableService },
    } = nodeFormContext;
    const { batchSize, concurrentSize, inputLists } = batchDTO;
    const inputListsVO = (inputLists || []).map(inputList => ({
      name: inputList.name,
      id: inputList.id,
      input: variableUtils.valueExpressionToVO(
        inputList.input,
        variableService,
      ),
    }));
    return {
      batchSize,
      concurrentSize,
      inputLists: inputListsVO as BatchVOInputList[],
    };
  }

  /**
   * @Deprecated using variableUtils.valueExpressionToDTO)
   * @param value
   * @param nodeFormContext
   * @returns
   */
  export function refExpressionToValueDTO(
    value: ValueExpression,
    nodeFormContext: any,
  ) {
    if (!value) {
      return;
    }
    const {
      playgroundContext: { variableService },
    } = nodeFormContext;

    return {
      input: variableUtils.valueExpressionToDTO(value, variableService, {
        node: nodeFormContext?.node,
      }),
    };
  }

  /**
   * @Deprecated using variableUtils.valueExpressionToDTO
   * @param value
   * @returns
   */
  export function literalExpressionToValueDTO(value: LiteralExpression) {
    if (isNil(value)) {
      return;
    }

    return {
      type: variableUtils.getLiteralExpressionValueDTOType(value.content),
      value: {
        type: 'literal',
        content: !isNil(value.content) ? String(value.content) : '',
      },
    };
  }

  export function getLiteralExpressionViewVariableType(
    content: LiteralExpression['content'],
  ) {
    if (isNil(content)) {
      return ViewVariableType.String;
    }
    if (isInteger(content)) {
      return ViewVariableType.Integer;
    } else if (isNumber(content)) {
      return ViewVariableType.Number;
    } else if (isBoolean(content)) {
      return ViewVariableType.Boolean;
    } else {
      return ViewVariableType.String;
    }
  }

  /**
   * @deprecated using variableUtils.valueExpressionToVO
   * @param value
   * @param nodeFormContext
   * @returns
   */
  export function refExpressionDTOToVO(value: any, nodeFormContext: any) {
    if (isNil(value)) {
      return;
    }
    const {
      playgroundContext: { variableService },
    } = nodeFormContext;
    return variableUtils.valueExpressionToVO(value.input, variableService);
  }

  /**
   * @deprecated using variableUtils.valueExpressionToVO
   * @param input
   * @returns
   */
  export function literalExpressionDTOToVO(input: any) {
    if (isNil(input)) {
      return;
    }
    const { type, value } = input;

    return {
      type: 'literal',
      content: variableUtils.getLiteralValueWithType(type, value?.content),
    };
  }

  // Get the default value of batch order item
  export function getBatchInputListFormDefaultValue(index: number) {
    return {
      name: `item${index}`,
      id: nanoid(),
      input: {
        type: ValueExpressionType.REF,
      },
    };
  }

  // Node support batch
  export function getBatchModeFormMeta(isBatchV2: boolean): IFormItemMeta {
    // TODO DELETE schemaGray temporary field, backend grey release brush data mark, delete after full amount
    return {
      name: 'batchMode',
      type: 'string',
      default: 'single',
      abilities: [
        {
          type: 'setter',
          options: {
            key: 'Radio',
            type: 'button',
            options: [
              {
                value: 'single',
                label: I18n.t('workflow_batch_tab_single_radio'),
              },
              {
                value: 'batch',
                label: I18n.t('workflow_batch_tab_batch_radio'),
                disabled: (context: SetterOrDecoratorContext) => {
                  const { node } = context;
                  if (
                    node.parent?.flowNodeType === FlowNodeBaseType.SUB_CANVAS
                  ) {
                    return true;
                  }
                },
              },
            ],
          },
        },
        {
          type: 'decorator',
          options: {
            key: 'FormCard',
            collapsible: false,
          },
        },
        {
          type: 'visibility',
          options: {
            hidden: isBatchV2,
          },
        },
      ],
    };
  }

  // formValueToDto & dtoToFormValue only migrates the adaptation of inputParameters and batch in api-node
  export function formValueToDto(value: any, context) {
    const inputParams = get(value, INPUT_PARAMS_PATH);
    const formattedInputParams = inputParams
      ? nodeUtils.mapToArray(inputParams, (key, mapValue) => ({
          name: key,
          input: mapValue,
        }))
      : [];

    const batchMode = get(value, BATCH_MODE_PATH);
    const batch = get(value, BATCH_PATH);

    const formattedBatch =
      batchMode === BatchMode.Batch
        ? {
            batchEnable: true,
            ...nodeUtils.batchToDTO(batch, context),
          }
        : undefined;

    set(value, INPUT_PARAMS_PATH, formattedInputParams);
    set(value, BATCH_PATH, formattedBatch);
    set(value, BATCH_MODE_PATH, undefined);
    set(value, SETTING_ON_ERROR_PATH, settingOnErrorSave(value).settingOnError);
    return value;
  }

  export function dtoToformValue(value, context) {
    const inputParams = get(value, INPUT_PARAMS_PATH);
    if (!inputParams || !Array.isArray(inputParams)) {
      return value;
    }
    const formattedInputParams = nodeUtils.arrayToMap(
      inputParams,
      'name',
      (arrayItem: InputValueVO) => arrayItem.input,
    );

    const batch = get(value, BATCH_PATH);

    const formattedBatchMode = batch?.batchEnable
      ? BatchMode.Batch
      : BatchMode.Single;
    const formattedBatch = batch?.batchEnable
      ? nodeUtils.batchToVO(batch, context)
      : undefined;

    set(value, INPUT_PARAMS_PATH, formattedInputParams);
    set(value, BATCH_MODE_PATH, formattedBatchMode);
    set(value, BATCH_PATH, formattedBatch);
    set(
      value,
      NODE_SETTING_ON_ERROR_PATH,
      settingOnErrorInit(value).settingOnError,
    );

    return value;
  }
}
