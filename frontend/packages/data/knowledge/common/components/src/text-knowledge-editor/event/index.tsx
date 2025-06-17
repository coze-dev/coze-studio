import { useEffect } from 'react';

import mitt from 'mitt';
import type { Emitter, Handler, EventType } from 'mitt';

import { type Chunk } from '../types/chunk';

// 定义事件名称字面量类型
export type EventTypeName =
  | 'previewContextMenuItemAction'
  | 'hoverEditBarAction';

/**
 * 事件类型定义
 */
export interface EventTypes extends Record<EventType, unknown> {
  // 右键菜单相关事件
  previewContextMenuItemAction: {
    type: 'add-after' | 'add-before' | 'delete' | 'edit';
    targetChunk: Chunk;
    newChunk?: Chunk;
    chunks?: Chunk[];
  };

  // 悬浮编辑栏相关事件
  hoverEditBarAction: {
    type: 'add-after' | 'add-before' | 'delete' | 'edit';
    targetChunk: Chunk;
    newChunk?: Chunk;
    chunks?: Chunk[];
  };
}

/**
 * 事件处理函数类型
 */
export type EventHandler<T extends EventTypeName> = Handler<EventTypes[T]>;

/**
 * 创建事件总线实例
 */
export const createEventBus = (): Emitter<EventTypes> => mitt<EventTypes>();

/**
 * 全局事件总线实例
 */
export const eventBus = createEventBus();

/**
 * 事件总线钩子
 * 用于在组件中使用事件总线
 */
export const useEventBus = () => eventBus;

/**
 * 监听事件钩子
 * 用于在组件中监听事件
 * @param eventName 事件名称
 * @param handler 事件处理函数
 * @param deps 依赖数组，当依赖变化时重新绑定事件
 */
export const useEventListener = <T extends EventTypeName>(
  eventName: T,
  handler: EventHandler<T>,
  deps: React.DependencyList = [],
) => {
  useEffect(() => {
    // 绑定事件
    eventBus.on(eventName, handler as Handler<unknown>);

    // 组件卸载时解绑事件
    return () => {
      eventBus.off(eventName, handler as Handler<unknown>);
    };
  }, deps);
};
