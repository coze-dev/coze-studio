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

import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Number } from './number';

const mockProps = {
  value: 0,
  onChange: vi.fn(),
};

async function clickNumberButtonDown(container: HTMLElement) {
  await clickNumberButton(container, 'down');
}

async function clickNumberButtonUp(container: HTMLElement) {
  await clickNumberButton(container, 'up');
}

async function clickNumberButton(container: HTMLElement, arrow: 'up' | 'down') {
  // Trigger the hover first
  const numberContainer = container.firstChild as HTMLElement;
  fireEvent.mouseEnter(numberContainer);

  // Wait for the next event loop
  await Promise.resolve();

  const upButton = container.querySelector(
    '.semi-input-number-button-up',
  ) as HTMLElement;
  const downButton = container.querySelector(
    '.semi-input-number-button-down',
  ) as HTMLElement;

  if (arrow === 'up') {
    fireEvent.mouseDown(upButton);
    fireEvent.mouseUp(upButton);
  } else {
    fireEvent.mouseDown(downButton);
    fireEvent.mouseUp(downButton);
  }
}

function inputValue(container: HTMLElement, value: number) {
  const inputElement = container.querySelector('input') as HTMLElement;
  fireEvent.input(inputElement, { target: { value } });
}

describe('Number Setter', () => {
  it('renders correctly with default props', () => {
    const { container } = render(
      // @ts-expect-error -- mock
      <Number {...mockProps} value={0} onChange={vi.fn} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the correct placeholder text', () => {
    const placeholderText = 'Enter a number';
    render(<Number {...mockProps} value={0} placeholder={placeholderText} />);
    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
  });

  it('calls onChange when value is changed', () => {
    const newValue = 5;
    const handleChange = vi.fn();

    const { container } = render(
      <Number {...mockProps} value={0} onChange={handleChange} />,
    );

    inputValue(container, newValue);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(newValue);
  });

  it('applies custom width when provided', () => {
    const customWidth = '50%';
    const { container } = render(
      <Number {...mockProps} value={0} width={customWidth} />,
    );

    expect(container.firstChild).toHaveStyle(`width: ${customWidth}`);
  });

  it('is readonly when readonly prop is true', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Number {...mockProps} value={0} onChange={handleChange} readonly />,
    );

    inputValue(container, 1);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not allow values less than min', async () => {
    const handleChange = vi.fn();
    const min = 0;
    const { container } = render(
      <Number {...mockProps} value={min} onChange={handleChange} min={min} />,
    );

    await clickNumberButtonDown(container);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not allow values greater than max', async () => {
    const handleChange = vi.fn();
    const max = 10;
    const { container } = render(
      <Number {...mockProps} value={max} onChange={handleChange} max={max} />,
    );

    await clickNumberButtonUp(container);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('increments value by step when using arrow up', async () => {
    const handleChange = vi.fn();
    const step = 2;
    const { container } = render(
      <Number {...mockProps} value={1} onChange={handleChange} step={step} />,
    );

    await clickNumberButtonUp(container);
    expect(handleChange).toBeCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('decrements value by step when using arrow down', async () => {
    const handleChange = vi.fn();
    const step = 2;
    const { container } = render(
      <Number {...mockProps} value={3} onChange={handleChange} step={step} />,
    );

    await clickNumberButtonDown(container);
    expect(handleChange).toBeCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
