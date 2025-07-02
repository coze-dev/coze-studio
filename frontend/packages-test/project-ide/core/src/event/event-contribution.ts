import { type Disposable } from '@flowgram-adapter/common';

export const EventService = Symbol('EventService');

export type EventName = string;

export type SupportEvent =
  | MouseEvent
  | DragEvent
  | KeyboardEvent
  | UIEvent
  | TouchEvent
  | any;
export type EventHandler = (event: SupportEvent) => boolean | undefined | void;

export interface EventRegsiter {
  handle: EventHandler;
  priority: number;
}

export interface EventService {
  /**
   * 监听全局的事件
   * @param name      触发的事件名
   * @param handle    触发事件后执行
   * @param priority  优先级
   */
  listenGlobalEvent: (
    name: EventName,
    handle: EventHandler,
    priority?: number,
  ) => Disposable;
}

export const EventContribution = Symbol('EventContribution');

export interface EventContribution {
  /**
   * 注册 event
   */
  registerEvent: (service: EventService) => void;
}
