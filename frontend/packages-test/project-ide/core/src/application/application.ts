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
   * 开始应用
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
   * 结束应用
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
