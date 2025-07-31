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
import { ResponsiveBox } from '../../../src/components/layout/ResponsiveBox';

describe('ResponsiveBox', () => {
  it('should render with default props', () => {
    const { container } = render(
      <ResponsiveBox contents={[<div key="1">Test Content</div>]} />,
    );

    // Check if the div element is rendered
    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.tagName).toBe('DIV');

    // Check if the content is correct
    expect(boxElement.textContent).toBe('Test Content');

    // There should be a basic class name by default
    expect(boxElement.className).toContain('w-full');
    expect(boxElement.className).toContain('flex');
    expect(boxElement.className).toContain('overflow-hidden');
    expect(boxElement.className).toContain('flex-col');
    expect(boxElement.className).toContain('sm:flex-col');
    expect(boxElement.className).toContain('md:flex-row');
    expect(boxElement.className).toContain('lg:flex-row');
  });

  it('should render with column reverse', () => {
    const { container } = render(
      <ResponsiveBox
        contents={[<div key="1">Test Content</div>]}
        colReverse={true}
      />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.className).toContain('flex-col-reverse');
    expect(boxElement.className).toContain('sm:flex-col-reverse');
  });

  it('should render with row reverse', () => {
    const { container } = render(
      <ResponsiveBox
        contents={[<div key="1">Test Content</div>]}
        rowReverse={true}
      />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.className).toContain('md:flex-row-reverse');
    expect(boxElement.className).toContain('lg:flex-row-reverse');
  });

  it('should render with gaps', () => {
    const { container } = render(
      <ResponsiveBox
        contents={[<div key="1">Test Content</div>]}
        gaps={{
          [ScreenRange.SM]: 1,
          [ScreenRange.MD]: 2,
          [ScreenRange.LG]: 3,
        }}
      />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.className).toContain('sm:gap-1');
    expect(boxElement.className).toContain('md:gap-2');
    expect(boxElement.className).toContain('lg:gap-3');
  });

  it('should render multiple content items', () => {
    const { container } = render(
      <ResponsiveBox
        contents={[
          <div key="1">Content 1</div>,
          <div key="2">Content 2</div>,
          <div key="3">Content 3</div>,
        ]}
      />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.children.length).toBe(3);
    expect(boxElement.textContent).toBe('Content 1Content 2Content 3');
  });

  it('should render with both column and row reverse', () => {
    const { container } = render(
      <ResponsiveBox
        contents={[<div key="1">Test Content</div>]}
        colReverse={true}
        rowReverse={true}
      />,
    );

    const boxElement = container.firstChild as HTMLElement;
    expect(boxElement.className).toContain('flex-col-reverse');
    expect(boxElement.className).toContain('sm:flex-col-reverse');
    expect(boxElement.className).toContain('md:flex-row-reverse');
    expect(boxElement.className).toContain('lg:flex-row-reverse');
  });
});
