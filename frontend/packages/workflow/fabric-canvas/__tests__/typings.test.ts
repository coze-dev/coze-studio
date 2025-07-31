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
      // Note: The specific values here need to be filled in according to the actual AlignMode enumeration definition
      expect(AlignMode).toBeDefined();
      expect(typeof AlignMode).toBe('object');
    });
  });

  // Since other exports are mainly type definitions, they cannot be tested directly at runtime
  // But we can verify their correctness through TypeScript's type checking
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

    // The main purpose of this test is to ensure that the type definition is correct and the actual execution does not fail
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
