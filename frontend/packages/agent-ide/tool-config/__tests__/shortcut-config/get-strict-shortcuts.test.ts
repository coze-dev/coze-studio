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
        // 没有 command_id
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
        // 没有 plugin_id
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
        // 没有 plugin_id
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
        // 使用其他工具类型
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
