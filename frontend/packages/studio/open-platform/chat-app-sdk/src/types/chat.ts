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

import { type ClientStore } from '@/store/global';
import { type WebChatClient } from '@/client';

export interface CozeWidgetProps {
  position?: 'static' | 'fixed';
  client: WebChatClient;
  globalStore: ClientStore;
}

export type WidgetAdapterProps = Pick<CozeWidgetProps, 'position' | 'client'>;
export type AstBtnProps = WidgetAdapterProps;
export type ChatIframProps = Pick<CozeWidgetProps, 'client'>;
export type ChatContentProps = Pick<CozeWidgetProps, 'client'>;
