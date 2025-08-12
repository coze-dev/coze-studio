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

/* eslint-disable @coze-arch/no-batch-import-or-export */
import type * as FormilyReact from '@formily/react';
import type * as FomilyCore from '@formily/core';

export type FormilyReactType = typeof FormilyReact;
export type FormilyCoreType = typeof FomilyCore;

export type FormilyModule =
  | {
      status: 'unInit' | 'loading' | 'error';
      formilyCore: null;
      formilyReact: null;
    }
  | {
      status: 'ready';
      formilyCore: FormilyCoreType;
      formilyReact: FormilyReactType;
    };

export interface FormilyContextProps {
  formilyModule: FormilyModule;
  retryImportFormily: () => void;
}
