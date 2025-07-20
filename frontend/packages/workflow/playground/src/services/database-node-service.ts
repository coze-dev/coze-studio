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
   * 将数据库设置字段转换为数据库设置字段DTO。
   * @param name 数据库设置字段DTO的名称
   * @param value 整个表单数据
   */
  abstract convertSettingFieldToDTO(
    name: string,
    value: any,
    node: FlowNodeEntity,
  ): any;
  /**
   * 将数据库设置字段DTO转换为数据库设置字段。
   * @param name 数据库设置字段DTO的名称
   * @param value 整个表单数据
   */
  abstract convertSettingFieldDTOToField(name: string, value: any): any;
  /**
   * 将表单中的条件DTO转换为条件
   * @param name 条件DTO的名称
   * @param value 整个表单数据
   */
  abstract convertConditionDTOToCondition(name: string, value: any): any;

  /**
   * 将条件逻辑DTO转换为条件逻辑。
   * @param name 条件逻辑DTO的名称
   * @param value 条件逻辑DTO的值
   * @returns value 整个表单数据
   */
  abstract convertConditionLogicDTOToConditionLogic(
    name: string,
    value: any,
  ): any;

  /**
   * 将条件逻辑转换为条件逻辑DTO。
   * @param name 条件逻辑的名称
   * @param value 条件逻辑的值
   * @returns value 整个表单数据
   */
  abstract convertConditionLogicToConditionLogicDTO(
    name: string,
    value: any,
  ): any;

  /**
   * 将条件转换为条件DTO
   * @param name 条件的名称
   * @param value 整个表单数据
   */
  abstract convertConditionToDTO(
    name: string,
    value: any,
    node: FlowNodeEntity,
  ): any;

  /**
   * 判断当前条件是否不需要右值
   * @param condition 当前条件数据
   * @returns 如果条件不需要左值则返回true，否则返回false
   */
  abstract checkConditionOperatorNoNeedRight(
    conditionOperator?: ConditionOperator,
  ): boolean;

  abstract store: any;

  /**
   * 查询当前数据库数据
   */
  abstract load(id: string): void;

  /**
   * 清空数据库缓存的错误信息
   */
  abstract clearDatabaseError(id: string): void;
}
