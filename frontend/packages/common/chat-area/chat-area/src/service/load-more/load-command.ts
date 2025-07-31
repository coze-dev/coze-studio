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

import { type LoadAction } from '../../store/message-index';
import { type LoadMoreEnvTools } from './load-more-env-tools';

export type LoadCommandEnvTools = Omit<
  LoadMoreEnvTools,
  'triggerChatListShowUp' | 'injectChatCore' | 'injectGetScrollController'
>;

export abstract class LoadCommand {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract load(): Promise<void>;
  abstract action: LoadAction | null;
}

export abstract class LoadEffect {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract run(): void;
}

export abstract class LoadAsyncEffect {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract runAsync(): Promise<void>;
}
