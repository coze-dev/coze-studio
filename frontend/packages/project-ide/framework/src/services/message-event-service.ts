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

import { injectable, inject } from 'inversify';
import { Emitter, type URI, WidgetManager } from '@coze-project-ide/client';

export interface MessageEvent<T = any> {
  name: string;
  data?: T;
}

/**
 * Widget communication service
 */
@injectable()
export class MessageEventService {
  @inject(WidgetManager) widgetManager: WidgetManager;

  /**
   * message queue
   */
  events = new Map<string, MessageEvent[]>();

  onSendEmitter = new Emitter<MessageEvent & { uri: URI }>();
  onSend = this.onSendEmitter.event;

  private toKey(uri: URI) {
    // Get the widget's unique index through URI
    return this.widgetManager.uriToWidgetID(uri);
  }

  /** Get message queue by URI */
  private get(uri: URI): MessageEvent[] {
    const key = this.toKey(uri);
    if (this.events.has(key)) {
      return this.events.get(key)!;
    }
    const queue = [];
    this.events.set(key, queue);
    return queue;
  }
  private delete(uri: URI) {
    const key = this.toKey(uri);
    return this.events.delete(key);
  }

  send(uri: URI, msg: MessageEvent) {
    this.get(uri).push(msg);
    this.onSendEmitter.fire({ uri, ...msg });
  }

  on(uri: URI) {
    const queue = this.get(uri);
    this.delete(uri);
    return queue;
  }

  compare(uriA: URI, uriB: URI) {
    return this.toKey(uriA) === this.toKey(uriB);
  }
}
