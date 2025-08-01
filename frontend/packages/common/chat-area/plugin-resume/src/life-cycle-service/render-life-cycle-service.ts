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

import {
  isRequireInfoInterruptMessage,
  type OnMessageBoxRenderContext,
  WriteableRenderLifeCycleService,
} from '@coze-common/chat-area';

import { InterruptMessageBox } from '../custom-components/interrupt-message';

export class ResumeRenderLifeCycleService extends WriteableRenderLifeCycleService<unknown> {
  onMessageBoxRender(ctx: OnMessageBoxRenderContext) {
    const { message } = ctx;

    if (isRequireInfoInterruptMessage(message)) {
      return {
        ...ctx,
        MessageBox: InterruptMessageBox,
      };
    }

    return ctx;
  }
}
