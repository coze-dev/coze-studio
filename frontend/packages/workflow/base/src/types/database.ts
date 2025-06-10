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
 * 数据库配置字段
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
 * 数据库条件
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
  // 对操作符的翻译前后端没有统一
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
