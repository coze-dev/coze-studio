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

import { inject, injectable } from 'inversify';
import { Emitter } from '@coze-project-ide/client';
import { type WsMessageProps } from '@coze-project-ide/base-interface';

import { OptionsService } from './options-service';

export const safeParseEvent = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch (e) {
    console.warn('parse app cmd payload error', e);
    return undefined;
  }
};

@injectable()
export class WsService {
  @inject(OptionsService) options: OptionsService;

  protected onMessageSendEmitter = new Emitter<WsMessageProps>();
  onMessageSend = this.onMessageSendEmitter.event;

  send(data: any) {
    return;
  }

  init() {
    return;
  }

  onDispose() {
    return;
  }
}
