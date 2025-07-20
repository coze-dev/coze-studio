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
 
import {
  shortcut_command,
  type ToolParams,
} from '@coze-arch/bot-api/playground_api';

import { type ToolInfo } from '../shortcut-tool/types';

// 根据shortcut获取toolInfo
export const getToolInfoByShortcut = (
  shortcut: shortcut_command.ShortcutCommand | undefined,
): ToolInfo => {
  if (!shortcut) {
    return {
      tool_type: '',
      tool_name: '',
      plugin_id: '',
      plugin_api_name: '',
      tool_params_list: [],
    };
  }
  const {
    tool_info: { tool_params_list = [], tool_name = '' } = {},
    tool_type,
    plugin_id,
    plugin_api_name,
    work_flow_id,
  } = shortcut;
  return {
    tool_type,
    tool_name,
    plugin_id,
    plugin_api_name,
    tool_params_list,
    work_flow_id,
  };
};

// 校验string：数字 + 英文 + _ & 不能是纯数字
export const validateCmdString = (value: string) =>
  /^[a-zA-Z0-9_]+$/.test(value) && !/^[0-9]+$/.test(value);

// 根据tool_type判断是否开启了tool
export const initToolEnabledByToolTYpe = (
  toolType: shortcut_command.ToolType | undefined,
) =>
  toolType !== undefined &&
  [
    shortcut_command.ToolType.ToolTypeWorkFlow,
    shortcut_command.ToolType.ToolTypePlugin,
  ].includes(toolType);

// 校验plugin和workflow参数是否为string|integer类型,不支持复杂的对象类型
export const validatePluginAndWorkflowParams = (
  params: ToolParams[],
  enableEmpty = false,
): {
  isSuccess: boolean;
  inValidType: 'empty' | 'complex' | '';
} => {
  if (!params.length) {
    return {
      isSuccess: enableEmpty,
      inValidType: 'empty',
    };
  }
  const isComplex = params.every(param => {
    const { type } = param;
    return type !== undefined && !['array', 'object'].includes(type);
  });
  return {
    isSuccess: isComplex,
    inValidType: isComplex ? '' : 'complex',
  };
};

// 校验shortcut_command是否重复
export const validateCommandNameRepeat = (
  checkShortcut: shortcut_command.ShortcutCommand,
  shortcuts: shortcut_command.ShortcutCommand[],
): boolean => {
  const { shortcut_command: shortcutCommand, command_id } = checkShortcut;
  return !shortcuts.some(
    shortcut =>
      command_id !== shortcut.command_id &&
      shortcut.shortcut_command === shortcutCommand,
  );
};
// 校验按钮名称command_name是否重复
export const validateButtonNameRepeat = (
  checkShortcut: shortcut_command.ShortcutCommand,
  shortcuts: shortcut_command.ShortcutCommand[],
): boolean => {
  const { command_name, command_id } = checkShortcut;
  return !shortcuts.some(
    shortcut =>
      command_id !== shortcut.command_id &&
      shortcut.command_name === command_name,
  );
};
