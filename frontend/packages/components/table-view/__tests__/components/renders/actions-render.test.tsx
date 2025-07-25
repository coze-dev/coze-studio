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
 
import React from 'react';

import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { ActionsRender } from '../../../src/components/renders/actions-render';

// 使用vi.mock的回调函数形式来避免linter错误
vi.mock('@coze-arch/coze-design/icons', () => ({
  IconCozEdit: () => <div data-testid="edit-icon" />,
  IconCozTrashCan: () => <div data-testid="delete-icon" />,
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
}));

vi.mock('@coze-arch/coze-design', () => ({
  Button: ({ children, onClick, icon, ...props }: any) => (
    <button data-testid="button" onClick={onClick} icon={icon} {...props}>
      {children}
    </button>
  ),
}));

describe('ActionsRender', () => {
  test('应该正确渲染编辑和删除按钮', () => {
    const mockRecord = { tableViewKey: 'key-123', name: 'Test' };
    const mockIndex = 0;

    render(<ActionsRender record={mockRecord} index={mockIndex} />);

    // 验证按钮被渲染
    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(2); // 编辑和删除按钮
  });

  test('应该在点击编辑按钮时调用onEdit回调', () => {
    const mockRecord = { tableViewKey: 'key-123', name: 'Test' };
    const mockIndex = 0;
    const mockOnEdit = vi.fn();

    render(
      <ActionsRender
        record={mockRecord}
        index={mockIndex}
        editProps={{ disabled: false, onEdit: mockOnEdit }}
      />,
    );

    // 点击编辑按钮
    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[0]); // 第一个按钮是编辑按钮

    // 验证编辑回调被调用
    expect(mockOnEdit).toHaveBeenCalledWith(mockRecord, mockIndex);
  });

  test('应该在点击删除按钮时调用onDelete回调', () => {
    const mockRecord = { tableViewKey: 'key-123', name: 'Test' };
    const mockIndex = 0;
    const mockOnDelete = vi.fn();

    render(
      <ActionsRender
        record={mockRecord}
        index={mockIndex}
        deleteProps={{ disabled: false, onDelete: mockOnDelete }}
      />,
    );

    // 点击删除按钮
    const buttons = screen.getAllByTestId('button');
    fireEvent.click(buttons[1]); // 第二个按钮是删除按钮

    // 验证删除回调被调用
    expect(mockOnDelete).toHaveBeenCalledWith(mockIndex);
  });

  test('当editDisabled为true时不应该渲染编辑按钮', () => {
    const mockRecord = { tableViewKey: 'key-123', name: 'Test' };
    const mockIndex = 0;

    render(
      <ActionsRender
        record={mockRecord}
        index={mockIndex}
        editProps={{ disabled: true }}
      />,
    );

    // 验证只有一个按钮（删除按钮）
    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(1);
  });

  test('当deleteDisabled为true时不应该渲染删除按钮', () => {
    const mockRecord = { tableViewKey: 'key-123', name: 'Test' };
    const mockIndex = 0;

    render(
      <ActionsRender
        record={mockRecord}
        index={mockIndex}
        deleteProps={{ disabled: true }}
      />,
    );

    // 验证只有一个按钮（编辑按钮）
    const buttons = screen.getAllByTestId('button');
    expect(buttons).toHaveLength(1);
  });
});
