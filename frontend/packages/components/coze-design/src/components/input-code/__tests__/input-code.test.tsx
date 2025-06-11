import '@testing-library/jest-dom';
import { describe, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { render, fireEvent } from '@testing-library/react';

import { InputCode } from '..';

describe('InputCode', () => {
  it('render correctly', () => {
    const { queryByTestId } = render(<InputCode data-testid="InputCode" />);
    expect(queryByTestId('InputCode')).not.toBe(null);
  });

  it('test value', () => {
    const { queryByText } = render(<InputCode value="8" />);
    expect(queryByText('8')).not.toBe(null);
  });

  it('test input text', () => {
    vi.useFakeTimers();
    const { queryByLabelText, queryByText } = render(
      <InputCode type="text" inputProps={{ 'aria-label': 'input' }} />,
    );
    const input = queryByLabelText('input');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    vi.runAllTimers();
    expect(queryByText('1')).not.toBe(null);
  });

  it('test input password', () => {
    vi.useFakeTimers();
    const { queryByLabelText, queryByText } = render(
      <InputCode inputProps={{ 'aria-label': 'input' }} />,
    );
    const input = queryByLabelText('input');
    act(() => {
      // @ts-expect-error -- linter-disable-autofix
      fireEvent.change(input, {
        target: {
          value: '1',
        },
      });
      vi.runAllTimers();
    });

    expect(queryByText('1')).toBe(null);
  });

  it('test disabled', () => {
    const { queryByLabelText, queryByText } = render(
      <InputCode
        disabled
        inputProps={{
          'aria-label': 'input',
        }}
        value="1"
      />,
    );
    const input = queryByLabelText('input');
    expect(input).toBeDisabled();
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.keyDown(input, {
      key: 'Backspace',
    });
    expect(queryByText('1')).not.toBe(null);
  });

  it('test focus input', () => {
    const fn = vi.fn();
    const { queryByLabelText, queryByTestId } = render(
      <InputCode
        data-testid="InputCode"
        inputProps={{
          onFocus: fn,
          'aria-label': 'input',
        }}
      />,
    );
    const inputCode = queryByTestId('InputCode');
    const input = queryByLabelText('input');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.blur(input);
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(inputCode);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('test onChange', () => {
    const fn = vi.fn();
    const { queryByLabelText } = render(
      <InputCode
        inputProps={{
          'aria-label': 'input',
        }}
        onChange={fn}
      />,
    );
    const input = queryByLabelText('input');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalledWith('1');
  });

  it('test onFinish', () => {
    const fn = vi.fn();
    const { queryByLabelText } = render(
      <InputCode
        inputProps={{
          'aria-label': 'input',
        }}
        value="11111"
        onFinish={fn}
      />,
    );
    const input = queryByLabelText('input');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalledWith('111111');
  });

  it('test delete', () => {
    const { queryByLabelText, queryByText } = render(
      <InputCode
        inputProps={{
          'aria-label': 'input',
        }}
        value="1"
      />,
    );
    const input = queryByLabelText('input');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.keyDown(input, {
      key: 'Backspace',
    });
    expect(queryByText('1')).toBe(null);
  });
});
