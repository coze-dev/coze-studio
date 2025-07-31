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

/*******************************************************************************
 * Log related types
 */
/** The possible states of a line */
export enum LineStatus {
  /** Completely hidden, the last parent attribute nested child attribute will not be wired in the same column */
  Hidden,
  /** Full display, appearing only on adjacent lines of properties */
  Visible,
  /** Semi-display, non-adjacent lines */
  Half,
  /** Adjacent line of last property */
  Last,
}

/** Possible values in JsonViewer */
export type JsonValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

export interface Field {
  /** The use of arrays instead of'a.b.c 'is due to the possibility that key =' a.b 'will generate false nesting */
  path: string[];
  lines: LineStatus[];
  /** Here value can be any value, here is an incomplete enumeration */
  value: JsonValueType;
  children: Field[];
  /** Whether it is a drillable object (containing an array) */
  isObj: boolean;
}
