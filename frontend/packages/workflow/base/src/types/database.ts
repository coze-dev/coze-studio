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

import { type ValueExpression, type ValueExpressionType } from './vo';
import { type ViewVariableType } from './view-variable-type';
import { type ValueExpressionDTO } from './dto';
import { type ConditionOperator } from './condition';

export interface DatabaseField {
  id: number;
  name?: string;
  type?: ViewVariableType;
  required?: boolean;
  description?: string;
  isSystemField?: boolean;
}

export interface WorkflowDatabase {
  id: string;
  fields?: DatabaseField[];
  iconUrl?: string;
  tableName?: string;
  tableDesc?: string;
}

/**
 * Database configuration field
 */
export interface DatabaseSettingField {
  fieldID: number;
  fieldValue?: ValueExpression;
}

export interface DatabaseSettingFieldIDDTO {
  name: 'fieldID';
  input: {
    type: 'string';
    value: {
      type: 'literal';
      content: string;
    };
  };
}

export interface DatabaseSettingFieldValueDTO {
  name: 'fieldValue';
  input?: ValueExpressionDTO;
}

export type DatabaseSettingFieldDTO = [
  DatabaseSettingFieldIDDTO,
  DatabaseSettingFieldValueDTO | undefined,
];

/**
 * database conditions
 */
export type DatabaseConditionOperator = ConditionOperator;
export type DatabaseConditionLeft = string;
export type DatabaseConditionRight = ValueExpression;
export interface DatabaseCondition {
  left?: DatabaseConditionLeft;
  operator?: DatabaseConditionOperator;
  right?: DatabaseConditionRight;
}

export interface DatabaseConditionLeftDTO {
  name: 'left';
  input: {
    type: 'string';
    value: {
      type: ValueExpressionType.LITERAL;
      content: string;
    };
  };
}

export interface DatabaseConditionOperatorDTO {
  // Translation of operators is not uniform between front and back ends
  name: 'operation';
  input: {
    type: 'string';
    value: {
      type: ValueExpressionType.LITERAL;
      content: string;
    };
  };
}

export interface DatabaseConditionRightDTO {
  name: 'right';
  input?: ValueExpressionDTO;
}

export type DatabaseConditionDTO = [
  DatabaseConditionLeftDTO | undefined,
  DatabaseConditionOperatorDTO | undefined,
  DatabaseConditionRightDTO | undefined,
];
