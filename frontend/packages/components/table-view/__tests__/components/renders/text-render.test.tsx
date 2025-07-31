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

// simulated dependency
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

    // Verify that the text content is rendered correctly
    expect(screen.getByText('测试文本')).toBeInTheDocument();

    // Verify that the TextArea is not visible
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

    // Verify that the text content is rendered correctly
    expect(screen.getByText('测试文本')).toBeInTheDocument();

    // Click on the text to enter edit mode
    fireEvent.click(screen.getByText('测试文本'));

    // Verify that the TextArea is visible
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

    // Click on the text to enter edit mode
    fireEvent.click(screen.getByText('测试文本'));

    // Modify input value
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // Verify that onChange is invoked
    expect(mockOnChange).toHaveBeenCalledWith('新文本', mockRecord, mockIndex);
  });

  test('应该在失去焦点时调用 onBlur', async () => {
    // Using the dataIndex property
    render(
      <TextRender
        value="测试文本"
        record={mockRecord}
        index={mockIndex}
        onBlur={mockOnBlur}
        onChange={mockOnChange}
        editable={true}
        dataIndex="name" // Add dataIndex property
      />,
    );

    // Click on the text to enter edit mode
    fireEvent.click(screen.getByText('测试文本'));

    // Modify input value
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // Lost focus
    fireEvent.blur(screen.getByTestId('text-area'));

    // Verify that onBlur is called and the correct parameters are passed
    // Depending on the component implementation, onBlur will be called with the parameters inputValue, updateRecord, index
    // Where updateRecord is {... record, [dataIndex]: inputValue} and removed tableViewKey
    await waitFor(() => {
      expect(mockOnBlur).toHaveBeenCalledWith(
        '新文本',
        { id: '1', name: '新文本' }, // Updated records
        mockIndex,
      );
    });

    // Verify that the component returns to read-only mode
    await waitFor(() => {
      expect(screen.queryByTestId('text-area')).not.toBeInTheDocument();
      expect(screen.getByText('新文本')).toBeInTheDocument();
    });
  });

  test('应该在验证失败时显示错误提示', () => {
    const mockValidator = {
      validate: vi.fn().mockReturnValue(true), // Returning true indicates that the verification failed.
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
        isEditing={true} // Go straight to edit mode
      />,
    );

    // Verify that the TextArea is visible
    expect(screen.getByTestId('text-area')).toBeInTheDocument();

    // Modify input value
    fireEvent.change(screen.getByTestId('text-area'), {
      target: { value: '新文本' },
    });

    // The validation function is called
    expect(mockValidator.validate).toHaveBeenCalledWith(
      '新文本',
      mockRecord,
      mockIndex,
    );

    // validation error status
    expect(screen.getByTestId('text-area')).toHaveAttribute(
      'data-validate-status',
      'error',
    );

    // Validation error icons and prompts are displayed
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

    // Verify that the TextArea is directly visible
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

    // Verify that the TextArea is directly visible
    expect(screen.getByTestId('text-area')).toBeInTheDocument();

    // Render the component again, isEditing is undefined
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

    // Verify that the component returns to read-only mode
    await waitFor(() => {
      expect(screen.queryByTestId('text-area')).not.toBeInTheDocument();
      expect(screen.getByText('测试文本')).toBeInTheDocument();
    });
  });
});
