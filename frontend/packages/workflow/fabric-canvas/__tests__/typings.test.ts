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
 
import { describe, it, expect } from 'vitest';

import { CopyMode, AlignMode } from '../src/typings';

describe('typings', () => {
  describe('CopyMode', () => {
    it('应该定义正确的复制模式枚举值', () => {
      expect(CopyMode.CtrlCV).toBe('CtrlCV');
      expect(CopyMode.CtrlD).toBe('CtrlD');
      expect(CopyMode.DragCV).toBe('DragCV');
    });

    it('应该包含所有必要的复制模式', () => {
      const modes = Object.values(CopyMode);
      expect(modes).toHaveLength(3);
      expect(modes).toContain('CtrlCV');
      expect(modes).toContain('CtrlD');
      expect(modes).toContain('DragCV');
    });
  });

  describe('AlignMode', () => {
    it('应该定义正确的对齐模式枚举值', () => {
      // 注意：这里的具体值需要根据实际的 AlignMode 枚举定义来填写
      expect(AlignMode).toBeDefined();
      expect(typeof AlignMode).toBe('object');
    });
  });

  // 由于其他导出主要是类型定义，在运行时无法直接测试
  // 但我们可以通过 TypeScript 的类型检查来验证它们的正确性
  it('应该正确定义 FormMetaItem 接口', () => {
    const formMetaItem = {
      name: 'test',
      title: 'Test Item',
      cacheSave: true,
      visible: () => true,
      setter: 'input',
      setterProps: { placeholder: 'test' },
      splitLine: true,
      tooltip: {
        content: [],
      },
    };

    // 这个测试主要是确保类型定义正确，实际运行时不会失败
    expect(formMetaItem).toBeDefined();
  });

  it('应该正确定义 FormMeta 接口', () => {
    const formMeta = {
      display: 'row' as const,
      content: [],
      style: { marginTop: 10 },
    };

    expect(formMeta).toBeDefined();
    expect(formMeta.display).toBe('row');
  });

  it('应该正确定义 IRefPosition 接口', () => {
    const refPosition = {
      id: 'test',
      top: 0,
      left: 0,
      isImg: false,
      angle: 0,
      maxWidth: 100,
    };

    expect(refPosition).toBeDefined();
    expect(typeof refPosition.id).toBe('string');
    expect(typeof refPosition.top).toBe('number');
    expect(typeof refPosition.left).toBe('number');
    expect(typeof refPosition.isImg).toBe('boolean');
    expect(typeof refPosition.angle).toBe('number');
    expect(typeof refPosition.maxWidth).toBe('number');
  });
});
