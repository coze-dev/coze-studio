import { describe, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { Search, SearchInput } from '..';

describe('Search', () => {
  it('should has className coz-search', () => {
    render(<Search />);
    expect(document.getElementsByClassName('coz-search')).toHaveLength(1);
  });

  describe('Search event', () => {
    it('calls when the input changes', () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();
      const { container } = render(
        <Search onChange={onChange} onSearch={onSearch} />,
      );

      const input = container.querySelector('[data-testid="ui.search-input"]');
      const changedValue = 'new value';

      // 模拟改变输入
      // @ts-expect-error -- linter-disable-autofix
      fireEvent.change(input, { target: { value: changedValue } });
      expect(onChange).toHaveBeenCalledWith(changedValue, expect.anything());

      // 模拟键盘输入
      // @ts-expect-error -- linter-disable-autofix
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      expect(onSearch).toHaveBeenCalled();
    });
  });

  it('test searchInput focus', () => {
    const setFocusStatus = vi.fn();
    render(<SearchInput onFocus={() => setFocusStatus(true)} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // 模拟获得焦点
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.focus(input);
    expect(setFocusStatus).toHaveBeenCalledWith(true);
  });

  it('test searchInput blur', () => {
    const setFocusStatus = vi.fn();
    render(<SearchInput onBlur={() => setFocusStatus(false)} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // 模拟失去焦点
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.blur(input);
    expect(setFocusStatus).toHaveBeenCalledWith(false);
  });

  it('test searchInput onChange', () => {
    const fn = vi.fn();
    render(<SearchInput onChange={fn} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test searchInput onCompositionStart', () => {
    const fn = vi.fn();
    render(<SearchInput onCompositionStart={fn} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.compositionStart(input, {
      target: {
        value: 'onCompositionStart',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test searchInput onCompositionEnd', () => {
    const fn = vi.fn();
    render(<SearchInput onCompositionEnd={fn} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.compositionEnd(input, {
      target: {
        value: 'onCompositionEnd',
      },
    });
    expect(fn).toBeCalled();
  });

  it('test searchInput onCompositionUpdate', () => {
    const fn = vi.fn();
    render(<SearchInput onCompositionUpdate={fn} />);
    const input = document.querySelector('[data-testid="ui.search-input"]');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.compositionUpdate(input, {
      target: {
        value: 'onCompositionUpdate',
      },
    });
    expect(fn).toBeCalled();
  });
});
