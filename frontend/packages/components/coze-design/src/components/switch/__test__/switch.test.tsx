import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';

import { Switch } from '..';

describe('Select', () => {
  it('should render', () => {
    const { baseElement } = render(<Switch />);
    expect(baseElement.querySelectorAll('.coz-switch').length).toEqual(1);
  });

  it('onChange should be called', () => {
    const onChange = vi.fn();
    const { baseElement } = render(<Switch onChange={onChange} />);

    act(() => {
      // @ts-expect-error -- linter-disable-autofix
      fireEvent.click(baseElement.querySelector('.semi-switch-native-control'));
    });

    expect(onChange).toBeCalled();

    const dom = document.querySelector<HTMLInputElement>(
      '.semi-switch-native-control',
    );
    // @ts-expect-error -- linter-disable-autofix
    expect(dom.checked).toBe(true);
  });

  it('default checked', () => {
    render(<Switch checked />);
    const dom = document.querySelector<HTMLInputElement>(
      '.semi-switch-native-control',
    );
    // @ts-expect-error -- linter-disable-autofix
    expect(dom.checked).toBe(true);
  });
});
