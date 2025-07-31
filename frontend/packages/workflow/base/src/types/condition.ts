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

export enum ConditionLogic {
  OR = 1,
  AND = 2,
}

export enum ConditionLogicDTO {
  OR = 'OR',
  AND = 'AND',
}

export type ConditionOperator =
  | 'EQUAL' // "="
  | 'NOT_EQUAL' // "< >" or "! ="
  | 'GREATER_THAN' // ">"
  | 'LESS_THAN' // "<"
  | 'GREATER_EQUAL' // ">="
  | 'LESS_EQUAL' // "<="
  | 'IN' // "IN"
  | 'NOT_IN' // "NOT IN"
  | 'IS_NULL' // "IS NULL"
  | 'IS_NOT_NULL' // "IS NOT NULL"
  | 'LIKE' // "LIKE" fuzzy match string
  | 'NOT_LIKE' // "NOT LIKE" inverse fuzzy match
  | 'BE_TRUE' // "BE TRUE" is true
  | 'BE_FALSE'; // "BE FALSE" Boolean value false
