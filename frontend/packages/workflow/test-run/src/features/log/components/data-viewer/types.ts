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
