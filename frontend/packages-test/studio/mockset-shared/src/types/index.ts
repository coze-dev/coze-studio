import { type MockRule } from '@coze-arch/bot-api/debugger_api';

export enum MockDataValueType {
  STRING = 'string',
  INTEGER = 'integer',
  NUMBER = 'number',
  OBJECT = 'object',
  ARRAY = 'array',
  BOOLEAN = 'boolean',
}

export enum MockDataStatus {
  DEFAULT = 'default',
  REMOVED = 'removed',
  ADDED = 'added',
}

export interface MockDataWithStatus {
  /** key */
  key: string;
  /**  字段名称 */
  label: string;
  /**  字段值 */
  realValue?: string | number | boolean;
  /**  展示使用 */
  displayValue?: string;
  /**  描述 */
  description?: string;
  /**  是否必填 */
  isRequired: boolean;
  /**  字段数据类型 */
  type: MockDataValueType;
  /**  for array */
  childrenType?: MockDataValueType;
  /**  字段状态 */
  status: MockDataStatus;
  /**  字段子节点 */
  children?: MockDataWithStatus[];
}

export interface MockDataInfo {
  schema?: string;
  mock?: MockRule;
  mergedResultExample?: string;
  incompatible?: boolean;
}
