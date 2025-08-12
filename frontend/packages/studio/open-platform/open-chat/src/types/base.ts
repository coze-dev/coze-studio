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

import { type ReactNode } from 'react';

export enum Layout {
  PC = 'pc',
  MOBILE = 'mobile',
}

export interface HeaderConfig {
  isShow?: boolean; //Whether to display headers, the default is true
  isNeedClose?: boolean; //Whether you need the close button, the default is true.
  extra?: ReactNode | false; // For standing, default none
}

export interface DebugProps {
  cozeApiRequestHeader?: Record<string, string>;
}
