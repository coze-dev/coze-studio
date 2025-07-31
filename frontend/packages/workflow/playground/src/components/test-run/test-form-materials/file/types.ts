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

import type { ComponentAdapterCommonProps } from '../../types';

export enum FileInputType {
  UPLOAD = 'upload',
  INPUT = 'input',
}

export type FileProps = ComponentAdapterCommonProps<string> & {
  accept: string;
  multiple: boolean;
  disabled?: boolean;
  fileType: 'object' | 'image' | 'voice';
  // Support file address input
  enableInputURL?: boolean;
  // File input type change event
  fileInputType?: string;
  // File input type change event
  onInputTypeChange?: (v: string) => void;
  // File type selection class name
  inputTypeSelectClassName?: string;
  // URL Enter class name
  inputURLClassName?: string;
  containerClassName?: string;
};

export type BaseFileProps = Omit<FileProps, 'fileType'> & {
  fileType: 'object' | 'image';
  className?: string;
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
