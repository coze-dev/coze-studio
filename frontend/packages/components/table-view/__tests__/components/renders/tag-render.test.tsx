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

import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { TagRender } from '../../../src/components/renders/tag-render';

vi.mock('@coze-arch/coze-design', () => ({
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

    // Verify that the tag content is rendered correctly
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

    // Verify that the label uses the default color
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

    // Verify labels with custom colors
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveAttribute('data-color', 'red');
  });

  test('应该处理 undefined 值', () => {
    const mockRecord = { id: '1', name: 'Test' };
    const mockIndex = 0;

    render(
      <TagRender value={undefined} record={mockRecord} index={mockIndex} />,
    );

    // Verify tag content is empty string
    const tag = screen.getByTestId('tag');
    expect(tag).toHaveTextContent('');
  });
});
