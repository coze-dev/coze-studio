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

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { ScreenRange } from '../../../src/constant';
import { ResponsiveList } from '../../../src/components/layout/ResponsiveList';

describe('ResponsiveList', () => {
  const testItems = [
    { id: '1', content: <div>Item 1</div> },
    { id: '2', content: <div>Item 2</div> },
    { id: '3', content: <div>Item 3</div> },
  ];

  it('should render with default props', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
      />,
    );

    // Check if the div element is rendered
    const listElement = container.firstChild as HTMLElement;
    expect(listElement.tagName).toBe('DIV');

    // Check if all items are rendered
    const gridElement = listElement.firstChild as HTMLElement;
    expect(gridElement.children.length).toBe(3);
    expect(gridElement.textContent).toBe('Item 1Item 2Item 3');

    // Check default class name
    expect(listElement.className).toContain('flex');
    expect(listElement.className).toContain('flex-col');
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
        className="custom-class"
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    expect(listElement.className).toContain('custom-class');
  });

  it('should render with responsive grid columns', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
        gridCols={{
          [ScreenRange.SM]: 1,
          [ScreenRange.MD]: 2,
          [ScreenRange.LG]: 3,
        }}
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    const gridElement = listElement.firstChild as HTMLElement;
    expect(gridElement.className).toContain('sm:grid-cols-1');
    expect(gridElement.className).toContain('md:grid-cols-2');
    expect(gridElement.className).toContain('lg:grid-cols-3');
  });

  it('should render with responsive grid gap X', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
        gridGapXs={{
          [ScreenRange.SM]: 1,
          [ScreenRange.MD]: 2,
          [ScreenRange.LG]: 3,
        }}
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    const gridElement = listElement.firstChild as HTMLElement;
    expect(gridElement.className).toContain('sm:gap-x-1');
    expect(gridElement.className).toContain('md:gap-x-2');
    expect(gridElement.className).toContain('lg:gap-x-3');
  });

  it('should render with responsive grid gap Y', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
        gridGapYs={{
          [ScreenRange.SM]: 1,
          [ScreenRange.MD]: 2,
          [ScreenRange.LG]: 3,
        }}
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    const gridElement = listElement.firstChild as HTMLElement;
    expect(gridElement.className).toContain('sm:gap-y-1');
    expect(gridElement.className).toContain('md:gap-y-2');
    expect(gridElement.className).toContain('lg:gap-y-3');
  });

  it('should render with footer', () => {
    const { container } = render(
      <ResponsiveList
        dataSource={testItems}
        renderItem={item => item.content}
        footer={<div>Footer Content</div>}
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    expect(listElement.children.length).toBe(2); // grid + footer
    expect(listElement.textContent).toContain('Footer Content');
  });

  it('should render with empty content', () => {
    const { container } = render(
      <ResponsiveList<{ id: string; content: React.ReactNode }>
        dataSource={[]}
        renderItem={item => item.content}
        emptyContent={<div>No Data</div>}
      />,
    );

    const listElement = container.firstChild as HTMLElement;
    const gridElement = listElement.firstChild as HTMLElement;
    expect(gridElement.textContent).toBe('No Data');
  });
});
