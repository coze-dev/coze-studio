import { injectable, multiInject, optional } from 'inversify';
import { Disposable, DisposableCollection } from '@flowgram-adapter/common';

import { type LifecycleContribution } from '../';
import {
  type EventService,
  EventContribution,
  type EventName,
  type SupportEvent,
  type EventHandler,
  type EventRegsiter,
} from './event-contribution';

@injectable()
export class EventRegistry implements EventService, LifecycleContribution {
  protected toDispose = new DisposableCollection();

  protected globalEvents: {
    [key: string]: { handlers: EventRegsiter[] } & Disposable;
  } = {};

  onDispose(): void {
    this.toDispose.dispose();
  }

  @multiInject(EventContribution)
  @optional()
  protected readonly contributions: EventContribution[];

  onInit() {
    for (const contrib of this.contributions) {
      contrib.registerEvent(this);
    }
  }

  /**
   * 全局监听事件
   */
  listenGlobalEvent(
    name: EventName,
    handle: EventHandler,
    priority?: number | undefined,
  ): Disposable {
    return this._listenEvent(name, handle, priority);
  }

  // copy from pipelineRegistry
  private _listenEvent(
    name: SupportEvent,
    handle: EventHandler,
    priority = 0,
  ): Disposable {
    const eventsCache = this.globalEvents;
    let eventRegister = eventsCache[name];
    if (!eventRegister) {
      const realHandler = {
        handleEvent: (e: SupportEvent) => {
          const list = eventRegister.handlers;
          for (let i = 0, len = list.length; i < len; i++) {
            const prevent = list[i].handle(e);
            /* v8 ignore next 1 */
            if (prevent) {
              return;
            }
          }
        },
      };
      window.addEventListener(name, realHandler, false);
      eventRegister = eventsCache[name] = {
        handlers: [],
        dispose: () => {
          window.removeEventListener(name, realHandler);
          delete eventsCache[name];
        },
      };
    }
    const { handlers } = eventRegister;
    const item = { handle, priority };
    /**
     * handlers 排序：
     * 1. 后注册先执行 (符合冒泡规则)
     * 2. 按 priority 排序
     */
    handlers.unshift(item);
    handlers.sort((a, b) => b.priority - a.priority);
    const dispose = Disposable.create(() => {
      const index = eventRegister.handlers.indexOf(item);
      if (index !== -1) {
        eventRegister.handlers.splice(index, 1);
      }
      if (eventRegister.handlers.length === 0) {
        eventRegister.dispose();
      }
    });
    this.toDispose.push(dispose);
    return dispose;
  }
}
