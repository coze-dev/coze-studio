import { describe, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { Input } from '..';

describe('Input', () => {
  it('render correctly', () => {
    render(<Input />);
    const comp = document.getElementsByClassName('coz-input');
    expect(comp).toHaveLength(1);
  });

  it('test className', () => {
    render(<Input className="test" />);
    const comp = document.getElementsByClassName('coz-input');
    expect(comp[0].className).toContain('test');
  });

  it('test disabled', () => {
    render(<Input disabled={true} />);
    const input = document.getElementsByTagName('input');
    expect(input[0].disabled).toBe(true);
  });

  it('test loading', () => {
    render(<Input loading={true} />);
    expect(document.getElementsByTagName('svg')).toHaveLength(1);
    const input = document.getElementsByTagName('input');
    expect(input[0].disabled).toBe(true);
  });

  it('test error', () => {
    render(<Input error={true} />);
    const comp = document.getElementsByClassName('coz-input');
    expect(comp[0].className).toContain('coz-input-error');
  });

  it('test onChange', () => {
    const fn = vi.fn();
    render(<Input onChange={fn} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test onCompositionStart', () => {
    const fn = vi.fn();
    render(<Input onCompositionStart={fn} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.compositionStart(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test onCompositionUpdate', () => {
    const fn = vi.fn();
    render(<Input onCompositionUpdate={fn} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.compositionUpdate(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test onCompositionEnd', () => {
    const fn = vi.fn();
    render(<Input onCompositionEnd={fn} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.compositionEnd(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test getValueLength', () => {
    const getValueLength = (value: string) => value.length * 2;
    render(<Input maxLength={10} getValueLength={getValueLength} />);
    const input = document.getElementsByTagName('input')[0];
    fireEvent.change(input, {
      target: {
        value: 'aaaaaaaaaaa',
      },
    });
    expect(input.value.length).toBe(5);
  });

  it('test controlled', () => {
    const value = 'coze design';
    const newValue = 'coze design new';
    const { rerender } = render(<Input value={value} />);
    const input = document.getElementsByTagName('input')[0];
    expect(input.value).toBe(value);
    rerender(<Input value={newValue} />);
    expect(input.value).toBe(newValue);
  });

  it('test set undefined value', () => {
    const value = 'coze design';
    const { rerender } = render(<Input value={value} />);
    const input = document.getElementsByTagName('input')[0];
    expect(input.value).toBe(value);
    rerender(<Input value={undefined} />);
    expect(input.value).toBe('');
  });
});
