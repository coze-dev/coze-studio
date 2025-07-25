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
 
import { type URI } from '@coze-project-ide/client';

import { type ProjectIDEServices } from '../types';
import { type WidgetService } from '../plugins/create-preset-plugin/widget-service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface WidgetContext<T = any> {
  uri?: URI; // 当前 widget 的 uri
  store: T; // 当前 widget 的 store
  widget: WidgetService;
  services: ProjectIDEServices; // 全局的 ide 服务
}

export const WidgetContext = Symbol('WidgetContext');
