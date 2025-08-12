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
/*******************************************************************************
 * Test form related types
 */

import type { CSSProperties } from 'react';

import type { TestFormType } from '../constants';

export type TestFormField = any;
/**
 * Run the test run required test form schema
 */
export interface TestFormSchema {
  /**
   * Start Node ID
   * A single node runs for the node id.
   * Full run as start node id
   */
  id: string;

  /**
   * Type of form
   */
  type: TestFormType;
  /** form model */
  mode?: 'form' | 'json';
  /**
   * Render the form schema
   */
  fields: TestFormField[];
}

export type FormDataType = any;

/**
 * Common props for testing formed materials
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
  // Null indicates the whole process
  node_id?: string;
}
