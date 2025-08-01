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

import { injectable, inject, named } from 'inversify';
import { ContributionProvider, Emitter } from '@flowgram-adapter/common';

import { LifecycleContribution } from '../common/lifecycle-contribution';

@injectable()
export class Application {
  @inject(ContributionProvider)
  @named(LifecycleContribution)
  protected readonly contributionProvider: ContributionProvider<LifecycleContribution>;

  private onDidInitEmitter = new Emitter<void>();

  onDidInit = this.onDidInitEmitter.event;

  private onDidLoadingEmitter = new Emitter<void>();

  onDidLoading = this.onDidLoadingEmitter.event;

  private onDidLayoutInitEmitter = new Emitter<void>();

  onDidLayout = this.onDidLayoutInitEmitter.event;

  private onDidStartEmitter = new Emitter<void>();

  onDidStart = this.onDidStartEmitter.event;

  init(): void {
    const contribs = this.contributionProvider.getContributions();
    for (const contrib of contribs) {
      contrib.onInit?.();
    }
    this.onDidInitEmitter.fire();
  }

  /**
   * Start application
   */
  async start(): Promise<void> {
    const contribs = this.contributionProvider.getContributions();
    for (const contrib of contribs) {
      await contrib.onLoading?.();
    }
    this.onDidLoadingEmitter.fire();
    for (const contrib of contribs) {
      await contrib.onLayoutInit?.();
    }
    this.onDidLayoutInitEmitter.fire();
    for (const contrib of contribs) {
      await contrib.onStart?.();
    }
    this.onDidStartEmitter.fire();
  }

  /**
   * end application
   */

  async dispose(): Promise<void> {
    const contribs = this.contributionProvider.getContributions();
    for (const contrib of contribs) {
      if (contrib.onWillDispose && contrib.onWillDispose()) {
        return;
      }
    }
    for (const contrib of contribs) {
      contrib.onDispose?.();
    }
  }
}
