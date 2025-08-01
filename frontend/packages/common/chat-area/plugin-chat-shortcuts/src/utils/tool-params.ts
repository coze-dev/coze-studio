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

// Get toolInfo by shortcut
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

// Check string: number + English + _ & cannot be pure numbers
export const validateCmdString = (value: string) =>
  /^[a-zA-Z0-9_]+$/.test(value) && !/^[0-9]+$/.test(value);

// According to tool_type determine whether the tool is turned on.
export const initToolEnabledByToolTYpe = (
  toolType: shortcut_command.ToolType | undefined,
) =>
  toolType !== undefined &&
  [
    shortcut_command.ToolType.ToolTypeWorkFlow,
    shortcut_command.ToolType.ToolTypePlugin,
  ].includes(toolType);

// Verify that the plugin and workflow parameters are of type string | integer, and do not support complex object types
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

// Check if shortcut_command duplicate
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
// Check button name command_name duplicate
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
