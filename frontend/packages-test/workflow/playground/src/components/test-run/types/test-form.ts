/* eslint-disable @typescript-eslint/no-explicit-any */
/*******************************************************************************
 * test form 相关类型
 */

import type { CSSProperties } from 'react';

import type { TestFormType } from '../constants';

export type TestFormField = any;
/**
 * 运行 test run 所需的 test form schema
 */
export interface TestFormSchema {
  /**
   * 起始节点 id
   * 单节点运行为该节点 id
   * 全量运行为 start 节点 id
   */
  id: string;

  /**
   * 表单的类型
   */
  type: TestFormType;
  /** 表单模型 */
  mode?: 'form' | 'json';
  /**
   * 渲染表单的 schema
   */
  fields: TestFormField[];
}

export type FormDataType = any;

/**
 * test form 物料的公共 props
 */
export interface ComponentAdapterCommonProps<T> {
  value: T;
  style?: CSSProperties;
  onChange?: (v?: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface TestFormDefaultValue {
  input?: Record<string, string>;
  batch?: Record<string, string>;
  bot_id?: string;
  // 为空表示全流程
  node_id?: string;
}
