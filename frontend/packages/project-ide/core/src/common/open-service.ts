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

import { named, injectable, inject } from 'inversify';
import {
  ContributionProvider,
  type MaybePromise,
  Emitter,
  Disposable,
  type Event,
} from '@flowgram-adapter/common';

import { type URI } from './uri';
import { prioritizeAll } from './prioritizeable';

export interface OpenerOptions {}

export const OpenHandler = Symbol('OpenHandler');
export interface OpenHandler {
  canHandle: (uri: URI, options?: OpenerOptions) => MaybePromise<number>;
  open: (uri: URI, options?: OpenerOptions) => MaybePromise<object | undefined>;
}

export const OpenerService = Symbol('OpenerService');
export interface OpenerService {
  /**
   * Jump Positioning
   * @param uri
   * @param options
   */
  open: (uri: URI, options?: OpenerOptions) => Promise<object | undefined>;

  /**
   * A request is triggered
   */
  onURIOpen: Event<{ uri: URI; options?: OpenerOptions }>;
}

@injectable()
export class DefaultOpenerService implements OpenerService {
  protected readonly customEditorOpenHandlers: OpenHandler[] = [];

  protected readonly onDidChangeOpenersEmitter = new Emitter<void>();

  protected readonly onURIOpenEmitter = new Emitter<{
    uri: URI;
    options?: OpenerOptions;
  }>();

  readonly onDidChangeOpeners = this.onDidChangeOpenersEmitter.event;

  readonly onURIOpen = this.onURIOpenEmitter.event;

  constructor(
    @inject(ContributionProvider)
    @named(OpenHandler)
    protected readonly handlersProvider: ContributionProvider<OpenHandler>,
  ) {}

  async open(uri: URI, options?: OpenerOptions): Promise<object | undefined> {
    const opener = await this.getOpener(uri, options);
    const result = await opener.open(uri, options);
    this.onURIOpenEmitter.fire({ uri, options });
    return result;
  }

  addHandler(openHandler: OpenHandler): Disposable {
    this.customEditorOpenHandlers.push(openHandler);
    this.onDidChangeOpenersEmitter.fire();

    return Disposable.create(() => {
      this.customEditorOpenHandlers.splice(
        this.customEditorOpenHandlers.indexOf(openHandler),
        1,
      );
      this.onDidChangeOpenersEmitter.fire();
    });
  }

  protected async prioritize(
    uri: URI,
    options?: OpenerOptions,
  ): Promise<OpenHandler[]> {
    const prioritized = await prioritizeAll<any>(
      this.getHandlers(),
      async (handler: any) => {
        try {
          return await handler.canHandle(uri, options);
        } catch {
          return 0;
        }
      },
    );
    return prioritized.map((p: any) => p.value) as OpenHandler[];
  }

  async getOpener(uri: URI, options?: OpenerOptions): Promise<OpenHandler> {
    const handlers = await this.prioritize(uri, options);
    if (handlers.length >= 1) {
      return handlers[0];
    }
    return Promise.reject(new Error(`There is no opener for ${uri}.`));
  }

  async getOpeners(uri?: URI, options?: OpenerOptions): Promise<OpenHandler[]> {
    return uri ? this.prioritize(uri, options) : this.getHandlers();
  }

  protected getHandlers(): OpenHandler[] {
    return [
      ...this.handlersProvider.getContributions(),
      ...this.customEditorOpenHandlers,
    ];
  }
}
