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
  // Test basic rendering
  it('should render label and initial content', () => {
    const label = 'Test Label';
    const childContent = 'Child Content';
    render(<GroupCollapse label={label}>{childContent}</GroupCollapse>);

    const labelElement = screen.getByText(label);
    const childElement = screen.getByText(childContent);

    expect(labelElement).toBeInTheDocument();
    expect(childElement).toBeInTheDocument();
  });

  // Test prompt information rendering
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

  // Test Extra Content Rendering
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

  // Test click title to expand/collapse function
  it('should toggle content when clicking the title', () => {
    const childContent = 'Child Content';
    const { getByText, queryByText } = render(
      <GroupCollapse label="Test">{childContent}</GroupCollapse>,
    );

    // The content should be visible in the initial state
    expect(queryByText(childContent)).toBeInTheDocument();

    // Click on the title
    act(() => {
      fireEvent.click(getByText('Test'));
    });

    // Content should be hidden after clicking
    expect(queryByText(childContent)).toBeNull();
  });

  // Test sticky state style
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
