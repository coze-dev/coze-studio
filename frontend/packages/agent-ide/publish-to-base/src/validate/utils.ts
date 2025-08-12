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

import { InputComponentType } from '@coze-arch/bot-api/connector_api';

import { type BaseOutputStructLineType } from '../types';

const OUTPUT_TYPE_STRUCT = 25;
export const OUTPUT_TYPE_TEXT = 1;
const OUTPUT_TYPE_NUMBER = 2;

export const getIsStructOutput = (id: number): boolean =>
  id === OUTPUT_TYPE_STRUCT;

export const getIsTextOutput = (id: number | undefined): boolean =>
  id === OUTPUT_TYPE_TEXT;

export const getIsNumberOutput = (id: number | undefined): boolean =>
  id === OUTPUT_TYPE_NUMBER;

export const getIsSelectType = (type: InputComponentType) =>
  [InputComponentType.SingleSelect, InputComponentType.MultiSelect].includes(
    type,
  );

export const verifyOutputStructFieldAsGroupByKey = (
  field: BaseOutputStructLineType,
) => getIsTextOutput(field.output_type);

export const verifyOutputStructFieldAsPrimaryKey = (
  field: BaseOutputStructLineType,
) => {
  const outputType = field.output_type;
  return getIsTextOutput(outputType) || getIsNumberOutput(outputType);
};
