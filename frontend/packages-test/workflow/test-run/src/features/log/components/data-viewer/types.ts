/*******************************************************************************
 * log 相关的类型
 */
/** 线可能存在的几种状态 */
export enum LineStatus {
  /** 完全隐藏，最后一个父属性嵌套的子属性同列将不会有线 */
  Hidden,
  /** 完全显示，仅出现在属性相邻的线 */
  Visible,
  /** 半显示，非相邻的线 */
  Half,
  /** 最后属性的相邻线 */
  Last,
}

/** JsonViewer 中的 value 可能值 */
export type JsonValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

export interface Field {
  /** 使用数组而不是 'a.b.c' 是因为可能存在 key='a.b' 会产生错误嵌套 */
  path: string[];
  lines: LineStatus[];
  /** 这里 value 可能是任意值，这里是不完全枚举 */
  value: JsonValueType;
  children: Field[];
  /** 是否是可下钻的对象（包含数组） */
  isObj: boolean;
}
