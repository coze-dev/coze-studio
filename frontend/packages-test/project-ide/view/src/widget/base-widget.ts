import { injectable, decorate, unmanaged } from 'inversify';
import {
  Emitter,
  Disposable,
  DisposableCollection,
  type MaybePromise,
} from '@flowgram-adapter/common';

import { Widget } from '../lumino/widgets';
import { type Message } from '../lumino/messaging';
import type PerfectScrollbarType from '../components/scroll-bar/types/perfect-scrollbar';
import PerfectScrollbar from '../components/scroll-bar';

decorate(injectable(), Widget);
decorate(unmanaged(), Widget, 0);

export * from '../lumino/widgets';
export * from '../lumino/messaging';

export const PINNED_CLASS = 'flowide-mod-pinned';
export const LOCKED_CLASS = 'flowide-mod-locked';

@injectable()
export class BaseWidget extends Widget {
  protected readonly onDidChangeVisibilityEmitter = new Emitter<boolean>();

  readonly onDidChangeVisibility = this.onDidChangeVisibilityEmitter.event;

  protected readonly onDidDisposeEmitter = new Emitter<void>();

  readonly onDidDispose = this.onDidDisposeEmitter.event;

  protected readonly onUpdateEmitter = new Emitter<Message>();

  readonly onUpdate = this.onUpdateEmitter.event;

  protected readonly onActivateEmitter = new Emitter<Message>();

  readonly onActivate = this.onActivateEmitter.event;

  protected readonly toDispose = new DisposableCollection(
    this.onDidDisposeEmitter,
    Disposable.create(() => this.onDidDisposeEmitter.fire()),
    this.onDidChangeVisibilityEmitter,
    this.onUpdateEmitter,
    this.onActivateEmitter,
  );

  protected readonly toDisposeOnDetach = new DisposableCollection();

  protected scrollBar?: PerfectScrollbar;

  protected scrollOptions?: PerfectScrollbarType.Options;

  constructor(@unmanaged() options?: Widget.IOptions) {
    super(options);
  }

  override dispose(): void {
    if (this.isDisposed) {
      return;
    }
    super.dispose();
    this.toDispose.dispose();
  }

  readonly onDispose = this.toDispose.onDispose;

  protected override onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.dispose();
  }

  protected override onBeforeDetach(msg: Message): void {
    this.toDisposeOnDetach.dispose();
    super.onBeforeDetach(msg);
  }

  protected override onActivateRequest(msg: Message): void {
    this.onActivateEmitter.fire(msg);
    super.onActivateRequest(msg);
  }

  protected override onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    if (this.scrollOptions) {
      (async () => {
        const container = await this.getScrollContainer();
        container.style.overflow = 'hidden';
        this.scrollBar = new PerfectScrollbar(container, this.scrollOptions);
        this.disableScrollBarFocus(container);
        this.toDisposeOnDetach.push(
          Disposable.create(() => {
            if (this.scrollBar) {
              this.scrollBar.destroy();
              this.scrollBar = undefined;
            }
            container.style.overflow = 'initial';
          }),
        );
      })();
    }
  }

  protected getScrollContainer(): MaybePromise<HTMLElement> {
    return this.node;
  }

  protected disableScrollBarFocus(scrollContainer: HTMLElement): void {
    for (const thumbs of [
      scrollContainer.getElementsByClassName('ide-ps__thumb-x'),
      scrollContainer.getElementsByClassName('ide-ps__thumb-y'),
    ]) {
      for (let i = 0; i < thumbs.length; i++) {
        const element = thumbs.item(i);
        if (element) {
          element.removeAttribute('tabIndex');
        }
      }
    }
  }

  protected override onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.onUpdateEmitter.fire(msg);
    if (this.scrollBar) {
      this.scrollBar.update();
    }
  }

  override setFlag(flag: Widget.Flag): void {
    super.setFlag(flag);
    if (flag === Widget.Flag.IsVisible) {
      this.onDidChangeVisibilityEmitter.fire(this.isVisible);
    }
  }

  override clearFlag(flag: Widget.Flag): void {
    super.clearFlag(flag);
    if (flag === Widget.Flag.IsVisible) {
      this.onDidChangeVisibilityEmitter.fire(this.isVisible);
    }
  }
}
