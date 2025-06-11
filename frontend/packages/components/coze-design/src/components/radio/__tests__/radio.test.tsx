import { describe, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { Radio } from '../radio';

describe('Radio', () => {
  it('defaultChecked', () => {
    const { container } = render(<Radio defaultChecked={true} />);
    expect(container.getElementsByTagName('input')[0].checked).toBe(true);
  });

  it('disabled', () => {
    const { container } = render(<Radio disabled={true} />);
    expect(container.getElementsByTagName('input')[0].disabled).toBe(true);
  });

  it('checked controlled', () => {
    const { container } = render(<Radio checked={true} />);
    expect(container.getElementsByTagName('input')[0].checked).toBe(true);
  });

  it('onChange', () => {
    const fn = vi.fn();
    const { container } = render(<Radio onChange={fn} />);
    fireEvent.click(container.getElementsByClassName('semi-radio')[0]);
    expect(fn).toBeCalled();
    expect(fn.mock.calls[0][0].target.checked).toBe(true);
  });
});
