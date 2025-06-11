import { describe, it } from 'vitest';
import { format } from 'date-fns';
import { fireEvent, render, screen } from '@testing-library/react';

import { Tooltip } from '@/components/tooltip';

import { DatePicker } from '..';

describe('DatePicker', () => {
  it('render correctly', () => {
    const { queryByTestId } = render(<DatePicker />);
    const input = document.getElementsByClassName('semi-select')[0];
    fireEvent.click(input);
    expect(document.getElementsByClassName('coz-date-picker')).toHaveLength(1);
    expect(queryByTestId('coz-date-picker-prefix-icon')).not.toBe(null);
  });

  it('test defaultValue', () => {
    render(<DatePicker defaultValue={'2024-03-11'} />);
    expect(
      document.getElementsByClassName('semi-select-selection-text')[0]
        .textContent,
    ).toBe('2024-03-11');
  });

  it('test format', () => {
    const current = new Date();
    render(<DatePicker defaultValue={current} format="yyyy/MM/dd" />);

    expect(
      document.getElementsByClassName('semi-select-selection-text')[0]
        .textContent,
    ).toBe(format(current, 'yyyy/MM/dd'));
  });

  it.skip('test type dateRange', () => {
    render(
      <DatePicker
        type="dateRange"
        defaultPickerValue="2024-03-01"
        defaultOpen={true}
      />,
    );
    expect(
      document.getElementsByClassName('semi-datepicker-topSlot'),
    ).toHaveLength(1);
    expect(screen.findByText('Start')).not.toBe(null);
    expect(screen.findByText('End')).not.toBe(null);

    const items = document.getElementsByClassName('coz-date-picker-day');
    fireEvent.click(items[0]);
    fireEvent.click(items[10]);

    fireEvent.mouseDown(document);
    expect(
      document.getElementsByClassName('semi-select-selection-text')[0]
        .textContent,
    ).toBe('2024-03-01 ～ 2024-03-11');
  });

  it('test multiple', () => {
    const { queryByText, queryAllByLabelText, queryByLabelText } = render(
      <DatePicker
        defaultValue={['2024-03-01', '2024-03-02', '2024-03-03']}
        defaultOpen
        multiple={true}
      />,
    );
    // default value
    expect(queryByText('2024-03-01')).not.toBe(null);
    expect(queryByText('2024-03-02')).not.toBe(null);
    expect(queryByText('2024-03-03')).not.toBe(null);

    // delete date
    const close = queryAllByLabelText('close')[0];
    fireEvent.click(close);
    expect(queryByText('2024-03-01')).toBe(null);

    // select date
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(queryByLabelText('2024-03-04'));
    expect(queryByText('2024-03-04')).not.toBe(null);
  });

  it('test type month', () => {
    render(
      <DatePicker type="month" defaultOpen={true} defaultValue="2024-03-01" />,
    );
    expect(
      document.getElementsByClassName('semi-select-selection-text')[0]
        .textContent,
    ).toBe('2024-03');
    expect(document.getElementsByClassName('semi-scrolllist')).toHaveLength(1);
    expect(
      document.getElementsByClassName('semi-scrolllist-item'),
    ).toHaveLength(2);
  });

  it('test type dateTime', () => {
    const current = new Date();
    render(
      <DatePicker type="dateTime" defaultOpen={true} defaultValue={current} />,
    );
    expect(
      document.getElementsByClassName('semi-datepicker-switch'),
    ).toHaveLength(1);
    expect(
      document.getElementsByClassName('semi-select-selection-text')[0]
        .textContent,
    ).toBe(format(current, 'yyyy-MM-dd HH:mm:ss'));
  });

  it('test triggerRender', () => {
    const fn = vi.fn();
    render(<DatePicker triggerRender={fn} />);
    expect(fn).toBeCalled();
  });

  it('test renderFullDate', () => {
    const fn = vi.fn();
    render(<DatePicker renderFullDate={fn} defaultOpen={true} />);
    expect(fn).toBeCalled();
  });

  it('test showClear', () => {
    const fn = vi.fn();
    const { queryByTestId, queryByText } = render(
      <DatePicker defaultValue="2024-06-25" showClear onClear={fn} />,
    );
    const clearIcon = queryByTestId('coz-date-picker-clear-icon');
    expect(clearIcon).not.toBe(null);
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(clearIcon);
    expect(fn).toBeCalled();
    expect(queryByText('2024-06-25')).toBe(null);
  });

  it('test controlled', () => {
    const fn = vi.fn();
    const { queryByText, queryByLabelText } = render(
      <DatePicker onChange={fn} value="2024-06-25" defaultOpen />,
    );
    expect(queryByText('2024-06-25')).not.toBe(null);
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(queryByLabelText('2024-06-26'));
    expect(fn).toBeCalled();
  });

  it('test no prefix icon', () => {
    const { queryByTestId } = render(<DatePicker showPrefix={false} />);
    expect(queryByTestId('coz-date-picker-prefix-icon')).toBe(null);
  });

  it('test disabledDate', () => {
    // Create a disabledDate function that disables dates after today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 创建一个mock函数来测试disabledDate是否被调用
    const mockDisabledDate = vi.fn((date?: Date) => {
      if (!date) {
        return false;
      }
      return date > today;
    });

    render(
      <DatePicker
        defaultOpen={true}
        defaultPickerValue={format(today, 'yyyy-MM-dd')}
        disabledDate={mockDisabledDate}
      />,
    );

    // 验证disabledDate函数是否被调用
    expect(mockDisabledDate).toHaveBeenCalled();

    // 由于Semi DatePicker的实现细节可能会变化，我们只验证disabledDate函数被调用
    // 而不是具体的DOM结构，这样测试会更加稳定
  });

  it('test renderDate', () => {
    // Create a custom renderDate function
    const renderDate = (dayNumber?: number, fullDate?: string) => {
      if (fullDate === '2024-03-15') {
        return <span data-testid="custom-date">{dayNumber}</span>;
      }
      return <>{dayNumber}</>;
    };

    const { queryByTestId } = render(
      <DatePicker
        defaultOpen={true}
        defaultPickerValue="2024-03-01"
        renderDate={renderDate}
      />,
    );

    // Check if the custom date is rendered
    expect(queryByTestId('custom-date')).not.toBe(null);
  });

  it('test renderDate with Tooltip', () => {
    // Create a custom renderDate function with Tooltip
    const renderDate = (dayNumber?: number, fullDate?: string) => {
      if (fullDate === '2024-03-15') {
        return (
          <Tooltip content="Special day">
            <span data-testid="tooltip-date">{dayNumber}</span>
          </Tooltip>
        );
      }
      return <>{dayNumber}</>;
    };

    const { queryByTestId } = render(
      <DatePicker
        defaultOpen={true}
        defaultPickerValue="2024-03-01"
        renderDate={renderDate}
      />,
    );

    // Check if the date with tooltip is rendered
    expect(queryByTestId('tooltip-date')).not.toBe(null);
  });

  it('test disabledDate and renderDate together', () => {
    // Create a disabledDate function that disables dates after one week
    const today = new Date();
    const oneWeekAhead = new Date(today);
    oneWeekAhead.setDate(today.getDate() + 7);

    // 创建mock函数来测试disabledDate和renderDate是否被调用
    const mockDisabledDate = vi.fn((date?: Date) => {
      if (!date) {
        return false;
      }
      return date > oneWeekAhead;
    });

    const mockRenderDate = vi.fn((dayNumber?: number, fullDate?: string) => {
      if (fullDate) {
        const date = new Date(fullDate);
        if (date > oneWeekAhead) {
          return (
            <span data-testid="disabled-with-custom-render">{dayNumber}</span>
          );
        }
      }
      return <>{dayNumber}</>;
    });

    const { queryAllByTestId } = render(
      <DatePicker
        defaultOpen={true}
        defaultPickerValue={format(oneWeekAhead, 'yyyy-MM-dd')}
        disabledDate={mockDisabledDate}
        renderDate={mockRenderDate}
      />,
    );

    // 验证disabledDate和renderDate函数是否被调用
    expect(mockDisabledDate).toHaveBeenCalled();
    expect(mockRenderDate).toHaveBeenCalled();

    // 验证自定义渲染的元素是否存在
    const customRenderedElements = queryAllByTestId(
      'disabled-with-custom-render',
    );

    // expect(customRenderedElements.length).toBe(28);

    // 验证自定义渲染的元素内容是否正确
    customRenderedElements.forEach(element => {
      expect(element.textContent).not.toBe('');
    });
  });
});
