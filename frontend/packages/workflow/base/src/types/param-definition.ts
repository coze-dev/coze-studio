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

import { type ViewVariableType } from './view-variable-type';

/**
 * parameter definition
 *
 * Recursive definition, including a hierarchy of complex types
 */
export interface RecursedParamDefinition {
  name?: string;
  /** The Tree component requires each node to have a key, and the key is not suitable for assignment in any way such as name (before and after). Finally, the interface conversion layer provides a random key at one time. */
  fieldRandomKey?: string;
  desc?: string;
  required?: boolean;
  type: ViewVariableType;
  children?: RecursedParamDefinition[];
  // Region parameter value definition
  // The value of the input parameter can come from an upstream variable reference, or it can be a fixed value entered by the user (for complex types, only references are allowed).
  // If it is a fixed value, pass the fixedValue.
  // If it is a reference, pass the quotedValue.
  isQuote?: ParamValueType;
  /** parameter setting */
  fixedValue?: string;
  /** parameter reference */
  quotedValue?: [nodeId: string, ...path: string[]]; // string[]
  // endregion
}

export enum ParamValueType {
  QUOTE = 'quote',
  FIXED = 'fixed',
}
