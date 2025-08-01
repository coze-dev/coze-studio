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

import { Text } from './text';

const mockProps = {
  value: '',
  onChange: vi.fn(),
};

function inputValue(container: HTMLElement, value: string) {
  const inputElement = container.querySelector('textarea') as HTMLElement;
  fireEvent.input(inputElement, { target: { value } });
}

describe('Text Setter', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Text {...mockProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays the correct placeholder text', () => {
    const placeholderText = 'Enter some text';
    render(<Text {...mockProps} placeholder={placeholderText} />);
    const inputElement = screen.getByPlaceholderText(placeholderText);
    expect(inputElement).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <Text {...mockProps} onChange={handleChange} />,
    );

    const newValue = 'new text';
    inputValue(container, newValue);

    screen.logTestingPlaygroundURL();

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(newValue);
  });

  it('does not allow input when readonly is true', () => {
    const handleChange = vi.fn();
    const { container } = render(<Text {...mockProps} readonly />);
    const newValue = 'new text';

    inputValue(container, newValue);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
