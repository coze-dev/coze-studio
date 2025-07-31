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

export {
  ComponentAdapterCommonProps,
  TestFormSchema,
  FormDataType,
  TestFormField,
  TestFormDefaultValue,
} from './test-form';

/*******************************************************************************
 * Log related types
 */

/** Type of condition rvalue */
export enum ConditionRightType {
  Ref = 'ref',
  Literal = 'literal',
}

/** Possible values in the log */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

/** Formatted condition log */
export interface ConditionLog {
  leftData: LogValueType;
  rightData: LogValueType;
  operatorData: string;
}
/** Formatted log */
export interface Log {
  input:
    | {
        source: LogValueType;
        data: LogValueType;
      }
    | ConditionLog[];
  output: {
    source: LogValueType;
    data: LogValueType;
    rawSource: LogValueType;
    rawData: LogValueType;
  };
}
