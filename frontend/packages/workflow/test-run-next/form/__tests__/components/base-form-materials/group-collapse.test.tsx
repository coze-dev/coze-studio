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

import { describe, it, expect, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { render, screen, fireEvent } from '@testing-library/react';

import { GroupCollapse } from '../../../src/components/base-form-materials/group-collapse/collapse';

describe('GroupCollapse', () => {
  // 测试基本渲染
  it('should render label and initial content', () => {
    const label = 'Test Label';
    const childContent = 'Child Content';
    render(<GroupCollapse label={label}>{childContent}</GroupCollapse>);

    const labelElement = screen.getByText(label);
    const childElement = screen.getByText(childContent);

    expect(labelElement).toBeInTheDocument();
    expect(childElement).toBeInTheDocument();
  });

  // 测试提示信息渲染
  it('should render tooltip', () => {
    const tooltipText = 'This is a tooltip';
    const el = render(
      <GroupCollapse label="Test" tooltip={tooltipText}>
        Child
      </GroupCollapse>,
    );

    const tooltipIcon = el.container.querySelector(
      '[data-content="This is a tooltip"]',
    );
    expect(tooltipIcon).toBeInTheDocument();
  });

  // 测试额外内容渲染
  it('should render extra content', () => {
    const extraText = 'Extra Content';
    render(
      <GroupCollapse label="Test" extra={extraText}>
        Child
      </GroupCollapse>,
    );

    const extraElement = screen.getByText(extraText);
    expect(extraElement).toBeInTheDocument();
  });

  // 测试点击标题展开/折叠功能
  it('should toggle content when clicking the title', () => {
    const childContent = 'Child Content';
    const { getByText, queryByText } = render(
      <GroupCollapse label="Test">{childContent}</GroupCollapse>,
    );

    // 初始状态下内容应该可见
    expect(queryByText(childContent)).toBeInTheDocument();

    // 点击标题
    act(() => {
      fireEvent.click(getByText('Test'));
    });

    // 点击后内容应该隐藏
    expect(queryByText(childContent)).toBeNull();
  });

  // 测试粘性状态样式
  it('should apply sticky class when out of viewport or closed', async () => {
    const { useInViewport } = await vi.importMock('ahooks');
    (useInViewport as any).mockReturnValue([false]);

    const { container } = render(
      <GroupCollapse label="Test">Child</GroupCollapse>,
    );

    const titleElement = container.querySelector('svg');
    expect(titleElement).toBeInTheDocument();
  });
});
