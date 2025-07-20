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

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TextRender } from '../../../src/components/renders/text-render';

// 模拟依赖
vi.mock('@coze-arch/coze-design', () => ({
  TextArea: ({
    value,
    onChange,
    onBlur,
    readonly,
    validateStatus,
    ...props
  }: any) => (
    <div>
      <textarea
        data-testid="text-area"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onBlur={onBlur}
        readOnly={readonly}
        data-validate-status={validateStatus}
        {...props}
      />
      {validateStatus === 'error' && props.children}
    </div>
  ),
}));

vi.mock('@coze-arch/bot-semi', () => ({
  Tooltip: ({ content, children }: any) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

vi.mock('@coze-arch/bot-icons', () => ({
  IconToastError: () => <div data-testid="error-icon" />,
}));

describe('TextRender', () => {
  const mockRecord = { id: '1', name: 'Test' };
  const mockIndex = 0;
  const mockOnBlur = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('应该正确渲染只读模式', () => {
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
      />,
    );

    // 验证文本内容被正确渲染
    expect(screen.getByText('测试文本')).toBeInTheDocument();

    // 验证 TextArea 不可见
    expect(screen.queryByTestId('text-area')).not.toBeInTheDocument();
  });

  test('应该在可编辑模式下正确渲染', () => {
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
      />,
    );

    // 验证文本内容被正确渲染
    expect(screen.getByText('测试文本')).toBeInTheDocument();

    // 点击文本进入编辑模式
    fireEvent.click(screen.getByText('测试文本'));

    // 验证 TextArea 可见
    expect(screen.getByTestId('text-area')).toBeInTheDocument();
    expect(screen.getByTestId('text-area')).toHaveValue('测试文本');
  });

  test('应该在编辑模式下处理输入变化', () => {
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
      />,
    );

    // 点击文本进入编辑模式
    fireEvent.click(screen.getByText('测试文本'));

    // 修改输入值
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // 验证 onChange 被调用
    expect(mockOnChange).toHaveBeenCalledWith('新文本', mockRecord, mockIndex);
  });

  test('应该在失去焦点时调用 onBlur', async () => {
    // 使用 dataIndex 属性
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
        dataIndex="name" // 添加 dataIndex 属性
      />,
    );

    // 点击文本进入编辑模式
    fireEvent.click(screen.getByText('测试文本'));

    // 修改输入值
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // 失去焦点
    fireEvent.blur(screen.getByTestId('text-area'));

    // 验证 onBlur 被调用，并且传递了正确的参数
    // 根据组件实现，onBlur 会被调用，参数是 inputValue, updateRecord, index
    // 其中 updateRecord 是 { ...record, [dataIndex]: inputValue } 并且删除了 tableViewKey
    await waitFor(() => {
      expect(mockOnBlur).toHaveBeenCalledWith(
        '新文本',
        { id: '1', name: '新文本' }, // 更新后的 record
        mockIndex,
      );
    });

    // 验证组件回到只读模式
    await waitFor(() => {
      expect(screen.queryByTestId('text-area')).not.toBeInTheDocument();
      expect(screen.getByText('新文本')).toBeInTheDocument();
    });
  });

  test('应该在验证失败时显示错误提示', () => {
    const mockValidator = {
      validate: vi.fn().mockReturnValue(true), // 返回 true 表示验证失败
      errorMsg: '输入不合法',
    };

    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
        validator={mockValidator}
        isEditing={true} // 直接进入编辑模式
      />,
    );

    // 验证 TextArea 可见
    expect(screen.getByTestId('text-area')).toBeInTheDocument();

    // 修改输入值
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // 验证验证函数被调用
    expect(mockValidator.validate).toHaveBeenCalledWith(
      '新文本',
      mockRecord,
      mockIndex,
    );

    // 验证错误状态
    expect(screen.getByTestId('text-area')).toHaveAttribute(
      'data-validate-status',
      'error',
    );

    // 验证错误图标和提示被显示
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-content',
      '输入不合法',
    );
  });

  test('应该在 isEditing 为 true 时直接进入编辑模式', () => {
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
        isEditing={true}
      />,
    );

    // 验证 TextArea 直接可见
    expect(screen.getByTestId('text-area')).toBeInTheDocument();
    expect(screen.getByTestId('text-area')).toHaveValue('测试文本');
  });

  test('应该在 isEditing 从 true 变为 undefined 时退出编辑模式', async () => {
    const { rerender } = render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
        isEditing={true}
      />,
    );

    // 验证 TextArea 直接可见
    expect(screen.getByTestId('text-area')).toBeInTheDocument();

    // 重新渲染组件，isEditing 为 undefined
    rerender(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
      />,
    );

    // 验证组件回到只读模式
    await waitFor(() => {
      expect(screen.queryByTestId('text-area')).not.toBeInTheDocument();
      expect(screen.getByText('测试文本')).toBeInTheDocument();
    });
  });
});
