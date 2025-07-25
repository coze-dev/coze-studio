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
