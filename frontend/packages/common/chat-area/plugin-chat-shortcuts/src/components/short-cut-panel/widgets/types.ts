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

import { type PropsWithChildren, type FC } from 'react';

import { type RuleItem } from '@coze-arch/bot-semi/Form';
import { type InputType } from '@coze-arch/bot-api/playground_api';

import { type DSL } from '../../../types';

export interface FileValue {
  fileInstance?: File;
  url?: string;
  width?: number;
  height?: number;
}

export type TValue = string | FileValue | undefined;

export type TCustomUpload = (uploadParams: {
  file: File;
  onProgress?: (percent: number) => void;
  onSuccess?: (url: string, width?: number, height?: number) => void;
  onError?: (e: { status?: number }) => void;
}) => void;

export interface DSLContext {
  dsl: DSL;
  uploadFile?: TCustomUpload;
  onChange?: (value: Record<string, TValue>) => void; // Compatible files required
  onSubmit?: (value: Record<string, TValue>) => void;
  readonly?: boolean; // Support preview mode during build
}

export interface DSLFormFieldCommonProps {
  name: string;
  description?: string;
  rules: RuleItem[];
  defaultValue?: {
    type: InputType;
    value: string;
  };
}

export type DSLComponent<TProps = unknown> = FC<
  PropsWithChildren<{ context: DSLContext; props: TProps }>
>;
