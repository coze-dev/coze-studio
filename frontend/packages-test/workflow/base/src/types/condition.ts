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
  | 'NOT_EQUAL' // "<>" 或 "!="
  | 'GREATER_THAN' // ">"
  | 'LESS_THAN' // "<"
  | 'GREATER_EQUAL' // ">="
  | 'LESS_EQUAL' // "<="
  | 'IN' // "IN"
  | 'NOT_IN' // "NOT IN"
  | 'IS_NULL' // "IS NULL"
  | 'IS_NOT_NULL' // "IS NOT NULL"
  | 'LIKE' // "LIKE" 模糊匹配字符串
  | 'NOT_LIKE' // "NOT LIKE" 反向模糊匹配
  | 'BE_TRUE' // "BE TRUE" 布尔值为 true
  | 'BE_FALSE'; // "BE FALSE" 布尔值为 false
