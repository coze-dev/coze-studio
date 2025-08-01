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

export const createSelectAndSetFieldsFieldName = 'inputs.insertParam.fieldInfo';
export const databaseSelectFieldName = 'inputs.databaseInfoList';

export const orderByFieldName = 'inputs.selectParam.orderByList';
export const queryFieldsFieldName = 'inputs.selectParam.fieldList';
export const queryLimitFieldName = 'inputs.selectParam.limit';
export const queryConditionFieldName = 'inputs.selectParam.condition';
export const queryConditionListFieldName = `${queryConditionFieldName}.conditionList`;
export const queryConditionLogicFieldName = `${queryConditionFieldName}.logic`;

export const updateSelectAndSetFieldsFieldName = 'inputs.updateParam.fieldInfo';
export const updateConditionFieldName = 'inputs.updateParam.condition';
export const updateConditionListFieldName = `${updateConditionFieldName}.conditionList`;
export const updateConditionLogicFieldName = `${updateConditionFieldName}.logic`;

export const deleteConditionFieldName = 'inputs.deleteParam.condition';
export const deleteConditionListFieldName = `${deleteConditionFieldName}.conditionList`;
export const deleteConditionLogicFieldName = `${deleteConditionFieldName}.logic`;
