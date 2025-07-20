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
import { EditHeaderRender } from '../../../src/components/renders/edit-header-render';

// 模拟依赖
vi.mock('@coze-arch/bot-semi', () => {
  const uiButton = ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  );

  const uiInput = ({
    value,
    onChange,
    onBlur,
    readonly,
    suffix,
    ...props
  }: any) => (
    <div>
      <input
        data-testid="input"
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onBlur={() => onBlur && onBlur(value)}
        readOnly={readonly}
        {...props}
      />
      {suffix}
    </div>
  );

  const tooltip = ({ content, children }: any) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  );

  return {
    UIButton: uiButton,
    UIInput: uiInput,
    Tooltip: tooltip,
  };
});

vi.mock('@coze-arch/bot-icons', () => {
  const iconDeleteOutline = () => <div data-testid="delete-icon" />;
  const iconToastError = () => <div data-testid="error-icon" />;

  return {
    IconDeleteOutline: iconDeleteOutline,
    IconToastError: iconToastError,
  };
});

describe('EditHeaderRender', () => {
  test('应该正确渲染预览模式', () => {
    const mockOnBlur = vi.fn();

    render(
      <EditHeaderRender value="测试标题" onBlur={mockOnBlur} validator={{}} />,
    );

    // 验证预览模式显示正确的值
    const previewElement = screen.getByText('测试标题');
    expect(previewElement).toBeInTheDocument();
  });

  test('应该在点击预览文本时切换到编辑模式', () => {
    const mockOnBlur = vi.fn();

    render(
      <EditHeaderRender value="测试标题" onBlur={mockOnBlur} validator={{}} />,
    );

    // 点击预览文本
    const previewElement = screen.getByText('测试标题');
    fireEvent.click(previewElement);

    // 验证输入框出现
    const inputElement = screen.getByTestId('input');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveValue('测试标题');
  });

  test('应该在失焦时调用 onBlur 回调', () => {
    const mockOnBlur = vi.fn();
    const mockEditPropsOnBlur = vi.fn();

    // 渲染组件
    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={{}}
        editProps={{
          onBlur: mockEditPropsOnBlur,
        }}
      />,
    );

    // 点击预览文本进入编辑模式
    const previewElement = screen.getByText('测试标题');
    fireEvent.click(previewElement);

    // 获取输入框
    const inputElement = screen.getByTestId('input');

    // 触发 blur 事件，让组件内部的 onBlurFn 函数被调用
    fireEvent.blur(inputElement);

    // 验证 editProps.onBlur 被调用，并且传递了正确的参数
    expect(mockEditPropsOnBlur).toHaveBeenCalledWith('测试标题');
  });

  test('应该在编辑时更新输入值', () => {
    const mockOnBlur = vi.fn();
    const mockOnChange = vi.fn();

    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={{}}
        editProps={{
          onChange: mockOnChange,
        }}
      />,
    );

    // 点击预览文本进入编辑模式
    const previewElement = screen.getByText('测试标题');
    fireEvent.click(previewElement);

    // 获取输入框并修改值
    const inputElement = screen.getByTestId('input');
    fireEvent.change(inputElement, { target: { value: '新标题' } });

    // 验证 onChange 回调被调用
    expect(mockOnChange).toHaveBeenCalledWith('新标题');
  });

  test('应该在点击删除按钮时调用 onDelete 回调', () => {
    const mockOnBlur = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={{}}
        deleteProps={{
          disabled: false,
          onDelete: mockOnDelete,
        }}
      />,
    );

    // 点击删除按钮
    const deleteButton = screen.getByTestId('button');
    fireEvent.click(deleteButton);

    // 验证 onDelete 回调被调用
    expect(mockOnDelete).toHaveBeenCalledWith('测试标题');
  });

  test('应该在禁用状态下渲染删除按钮', () => {
    const mockOnBlur = vi.fn();
    const mockOnDelete = vi.fn();

    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={{}}
        deleteProps={{
          disabled: true,
          onDelete: mockOnDelete,
        }}
      />,
    );

    // 验证删除按钮被禁用
    const deleteButton = screen.getByTestId('button');
    expect(deleteButton).toHaveAttribute('disabled');

    // 点击删除按钮不应调用回调
    fireEvent.click(deleteButton);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('应该在非可编辑状态下不显示删除按钮', () => {
    const mockOnBlur = vi.fn();

    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={{}}
        editable={false}
      />,
    );

    // 验证删除按钮不存在
    expect(screen.queryByTestId('button')).not.toBeInTheDocument();
  });

  test('应该在验证失败时显示错误提示', () => {
    const mockOnBlur = vi.fn();
    const mockValidator = {
      validate: vi.fn().mockReturnValue(true),
      errorMsg: '输入不合法',
    };

    render(
      <EditHeaderRender
        value="测试标题"
        onBlur={mockOnBlur}
        validator={mockValidator}
      />,
    );

    // 点击预览文本进入编辑模式
    const previewElement = screen.getByText('测试标题');
    fireEvent.click(previewElement);

    // 由于我们的模拟实现中，错误图标和提示是通过 suffix 属性传递的
    // 所以我们需要检查 tooltip 和 error-icon 是否存在于文档中
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toHaveAttribute(
      'data-content',
      '输入不合法',
    );
  });
});
