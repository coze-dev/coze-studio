import { injectable } from 'inversify';
import { type Event, Emitter } from '@flowgram-adapter/common';

import { type LifecycleContribution } from './lifecycle-contribution';

@injectable()
export class WindowService implements LifecycleContribution {
  protected onUnloadEmitter = new Emitter<void>();

  protected onBeforeUnloadEmitter = new Emitter<BeforeUnloadEvent>();

  get onUnload(): Event<void> {
    return this.onUnloadEmitter.event;
  }

  get onBeforeUnload(): Event<BeforeUnloadEvent> {
    return this.onBeforeUnloadEmitter.event;
  }

  onStart(): void {
    this.registerUnloadListeners();
  }

  protected registerUnloadListeners(): void {
    window.addEventListener('unload', () => this.onUnloadEmitter.fire());
    window.addEventListener('beforeunload', e =>
      this.onBeforeUnloadEmitter.fire(e),
    );
  }
}
