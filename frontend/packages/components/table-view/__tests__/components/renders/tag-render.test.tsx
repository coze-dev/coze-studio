import React from 'react';

import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { TagRender } from '../../../src/components/renders/tag-render';

vi.mock('@coze/coze-design', () => ({
  Tag: ({ children, color, ...props }: any) => (
    <div data-testid="tag" data-color={color} {...props}>
      {children}
    </div>
  ),
}));

describe('TagRender', () => {
  test('应该正确渲染标签', () => {
    const mockRecord = { id: '1', name: 'Test' };
    const mockIndex = 0;

    render(
      <TagRender value="标签文本" record={mockRecord} index={mockIndex} />,
    );

    // 验证标签内容被正确渲染
    const tag = screen.getByTestId('tag');
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveTextContent('标签文本');
  });

  test('应该使用默认颜色渲染标签', () => {
    const mockRecord = { id: '1', name: 'Test' };
    const mockIndex = 0;

    render(
      <TagRender value="标签文本" record={mockRecord} index={mockIndex} />,
    );

    // 验证标签使用默认颜色
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveAttribute('data-color', 'primary');
  });

  test('应该使用自定义颜色渲染标签', () => {
    const mockRecord = { id: '1', name: 'Test' };
    const mockIndex = 0;

    render(
      <TagRender
        value="标签文本"
        record={mockRecord}
        index={mockIndex}
        color="red"
      />,
    );

    // 验证标签使用自定义颜色
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveAttribute('data-color', 'red');
  });

  test('应该处理 undefined 值', () => {
    const mockRecord = { id: '1', name: 'Test' };
    const mockIndex = 0;

    render(
      <TagRender value={undefined} record={mockRecord} index={mockIndex} />,
    );

    // 验证标签内容为空字符串
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveTextContent('');
  });
});
