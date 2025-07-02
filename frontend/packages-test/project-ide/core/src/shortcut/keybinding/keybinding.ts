import { getKeyLabel, isKeyStringMatch } from '../utils';

export interface Keybinding {
  /**
   * 关联 command，该 keybinding 触发后执行的 command
   */
  command: string;
  /**
   * 关联的快捷键，like：meta c
   */
  keybinding: string;
  /**
   * 是否阻止浏览器的默认行为
   */
  preventDefault?: boolean;
  /**
   * keybinding 触发上下文，和 contextkey service 关联
   */
  when?: string;
  /**
   * 通过 keybinding 的触发 command 的参数
   */
  args?: any;
}

/**
 * kiybinding 相关导出方法
 */
export namespace Keybinding {
  /**
   * 匹配键盘事件是否 macth 快捷键配置
   */
  export const isKeyEventMatch = isKeyStringMatch;

  export const getKeybindingLabel = getKeyLabel;
}
