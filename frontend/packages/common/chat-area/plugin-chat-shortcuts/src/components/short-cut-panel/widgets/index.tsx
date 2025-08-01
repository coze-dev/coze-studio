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

import { DSLFormUpload } from './upload';
import { type DSLComponent } from './types';
import { DSLFormInput } from './text-input';
import { DSLSubmitButton } from './submit-button';
import { DSLFormSelect } from './select';
import { DSLRoot } from './root';
import { DSLPlaceholer } from './placeholder';
import { DSLColumnLayout } from './layout';
import { DSLForm } from './form';

// Component parameters are determined at run time and cannot be subject to specific type constraints
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DSLWidgetsMap: Record<string, DSLComponent<any>> = {
  '@flowpd/cici-components/Input': DSLFormInput,
  '@flowpd/cici-components/Select': DSLFormSelect,
  '@flowpd/cici-components/Upload': DSLFormUpload,
  '@flowpd/cici-components/Placeholder': DSLPlaceholer,
  '@flowpd/cici-components/ColumnLayout': DSLColumnLayout,
  '@flowpd/cici-components/Form': DSLForm,
  '@flowpd/cici-components/PageContainer': DSLRoot,
  '@flowpd/cici-components/Button': DSLSubmitButton,
} as const;
