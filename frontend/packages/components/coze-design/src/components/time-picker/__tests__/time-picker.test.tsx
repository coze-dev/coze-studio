import { render } from '@testing-library/react';

import { TimePicker } from '..';

describe('TimePicker', () => {
  it('render correctly', () => {
    render(<TimePicker defaultOpen={true} defaultValue={'00:00:00'} />);
    expect(document.getElementsByClassName('coz-time-picker')).toHaveLength(1);
    expect(
      document.getElementsByClassName('coz-time-picker-popup'),
    ).toHaveLength(1);
    // showIcon
    expect(document.getElementsByClassName('semi-input-prefix')).toHaveLength(
      1,
    );
    // showUnit
    expect(
      document.getElementsByClassName('semi-scrolllist-item-sel')[0]
        .textContent,
    ).toBe('00时');
  });

  it('test no icon', () => {
    render(<TimePicker showIcon={false} />);
    expect(document.getElementsByClassName('semi-input-prefix')).toHaveLength(
      0,
    );
  });

  it('test no unit', () => {
    render(
      <TimePicker
        defaultOpen={true}
        showUnit={false}
        defaultValue={'00:00:00'}
      />,
    );
    expect(
      document.getElementsByClassName('semi-scrolllist-item-sel')[0]
        .textContent,
    ).toBe('00');
  });

  it('test disabled', () => {
    render(<TimePicker disabled={true} />);
    const input = document.getElementsByTagName('input')[0];
    expect(input.disabled).toBe(true);
    expect(input.placeholder).toBe('');
  });

  it('test triggerRender', () => {
    render(
      <TimePicker
        triggerRender={() => <div className="trigger">trigger</div>}
      />,
    );
    expect(document.getElementsByClassName('trigger')).toHaveLength(1);
  });
  it('test input cannot focus', () => {
    render(<TimePicker />);
    const inputEle = document.getElementsByTagName('input')[0];
    const fn = vi.fn();
    inputEle.onblur = fn;
    inputEle.focus();
    expect(fn).toBeCalled();
  });
});
