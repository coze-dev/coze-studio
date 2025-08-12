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

import { describe, expect, it } from 'vitest';
import { ToolType } from '@coze-arch/bot-api/playground_api';
import type { ShortcutCommand } from '@coze-arch/bot-api/playground_api';

import { getStrictShortcuts } from '../../src/shortcut-config/get-strict-shortcuts';

describe('getStrictShortcuts', () => {
  it('should return undefined when shortcuts is undefined', () => {
    expect(getStrictShortcuts(undefined)).toBeUndefined();
  });

  it('should filter out shortcuts without command_id', () => {
    const shortcuts: Partial<ShortcutCommand>[] = [
      {
        command_id: '1',
        tool_type: ToolType.ToolTypeWorkFlow,
        plugin_id: 'plugin1',
      },
      {
        // No command_id
        tool_type: ToolType.ToolTypeWorkFlow,
        plugin_id: 'plugin2',
      },
    ];

    const result = getStrictShortcuts(shortcuts);
    expect(result).toHaveLength(1);
    expect(result?.[0].command_id).toBe('1');
  });

  it('should filter out workflow shortcuts without plugin_id', () => {
    const shortcuts: Partial<ShortcutCommand>[] = [
      {
        command_id: '1',
        tool_type: ToolType.ToolTypeWorkFlow,
        plugin_id: 'plugin1',
      },
      {
        command_id: '2',
        tool_type: ToolType.ToolTypeWorkFlow,
        // No plugin_id
      },
    ];

    const result = getStrictShortcuts(shortcuts);
    expect(result).toHaveLength(1);
    expect(result?.[0].command_id).toBe('1');
  });

  it('should filter out plugin shortcuts without plugin_id', () => {
    const shortcuts: Partial<ShortcutCommand>[] = [
      {
        command_id: '1',
        tool_type: ToolType.ToolTypePlugin,
        plugin_id: 'plugin1',
      },
      {
        command_id: '2',
        tool_type: ToolType.ToolTypePlugin,
        // No plugin_id
      },
    ];

    const result = getStrictShortcuts(shortcuts);
    expect(result).toHaveLength(1);
    expect(result?.[0].command_id).toBe('1');
  });

  it('should keep valid shortcuts', () => {
    const shortcuts: Partial<ShortcutCommand>[] = [
      {
        command_id: '1',
        tool_type: ToolType.ToolTypeWorkFlow,
        plugin_id: 'plugin1',
      },
      {
        command_id: '2',
        tool_type: ToolType.ToolTypePlugin,
        plugin_id: 'plugin2',
      },
      {
        command_id: '3',
        // Use other tool types
        tool_type: ToolType.ToolTypeNone,
      },
    ];

    const result = getStrictShortcuts(shortcuts);
    expect(result).toHaveLength(3);
    expect(result?.map(item => item.command_id)).toEqual(['1', '2', '3']);
  });

  it('should handle empty array', () => {
    const shortcuts: Partial<ShortcutCommand>[] = [];
    const result = getStrictShortcuts(shortcuts);
    expect(result).toEqual([]);
  });
});
