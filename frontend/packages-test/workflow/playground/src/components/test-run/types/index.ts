export {
  ComponentAdapterCommonProps,
  TestFormSchema,
  FormDataType,
  TestFormField,
  TestFormDefaultValue,
} from './test-form';

/*******************************************************************************
 * log 相关的类型
 */

/** condition 右值的类型 */
export enum ConditionRightType {
  Ref = 'ref',
  Literal = 'literal',
}

/** log 中的 value 可能值 */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

/** 格式化之后的 condition log */
export interface ConditionLog {
  leftData: LogValueType;
  rightData: LogValueType;
  operatorData: string;
}
/** 格式化之后的 log */
export interface Log {
  input:
    | {
        source: LogValueType;
        data: LogValueType;
      }
    | ConditionLog[];
  output: {
    source: LogValueType;
    data: LogValueType;
    rawSource: LogValueType;
    rawData: LogValueType;
  };
}
