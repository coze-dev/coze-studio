export type IEventCenterEventName = EventCenterEventName | string;

/**
 * 事件中心内置的事件
 */
export const enum EventCenterEventName {
  /**
   * 插件初始化后的事件名
   */
  AbilityInitialed = 'abilityInitialed',
  /**
   * 折叠展开ContentBlock的事件
   */
  ToggleContentBlock = 'toggleContentBlock',
  /**
   * Agent Modal中tab切换的事件
   */
  AgentModalTabChange = 'agentModalTabChange',
  /**
   * Agent Modal中显隐发生变化
   */
  AgentModalVisibleChange = 'agentModalVisibleChange',
}
