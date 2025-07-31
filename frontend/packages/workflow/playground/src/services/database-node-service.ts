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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type ConditionOperator } from '@coze-workflow/base';
export abstract class DatabaseNodeService {
  /**
   * Converts a database settings field to a database settings field DTO.
   * @Param name Name of database settings field DTO
   * @Param value entire form data
   */
  abstract convertSettingFieldToDTO(
    name: string,
    value: any,
    node: FlowNodeEntity,
  ): any;
  /**
   * Converts the database settings field DTO to a database settings field.
   * @Param name Name of database settings field DTO
   * @Param value entire form data
   */
  abstract convertSettingFieldDTOToField(name: string, value: any): any;
  /**
   * Converts a conditional DTO in a form to a condition
   * @param name name of conditional DTO
   * @Param value entire form data
   */
  abstract convertConditionDTOToCondition(name: string, value: any): any;

  /**
   * Converts conditional logic DTO to conditional logic.
   * @param name name of conditional logic DTO
   * @Param value The value of the conditional logic DTO
   * @Returns value of entire form data
   */
  abstract convertConditionLogicDTOToConditionLogic(
    name: string,
    value: any,
  ): any;

  /**
   * Convert conditional logic to conditional logic DTO.
   * @param name name of conditional logic
   * @param value value of conditional logic
   * @Returns value of entire form data
   */
  abstract convertConditionLogicToConditionLogicDTO(
    name: string,
    value: any,
  ): any;

  /**
   * Convert Condition to Conditional DTO
   * @param name The name of the condition
   * @Param value entire form data
   */
  abstract convertConditionToDTO(
    name: string,
    value: any,
    node: FlowNodeEntity,
  ): any;

  /**
   * Determine whether the current condition does not require an rvalue
   * @param condition Current condition data
   * @Returns true if the condition does not require an lvalue, false otherwise
   */
  abstract checkConditionOperatorNoNeedRight(
    conditionOperator?: ConditionOperator,
  ): boolean;

  abstract store: any;

  /**
   * Query the current database data
   */
  abstract load(id: string): void;

  /**
   * Error messages for clearing the database cache
   */
  abstract clearDatabaseError(id: string): void;
}
