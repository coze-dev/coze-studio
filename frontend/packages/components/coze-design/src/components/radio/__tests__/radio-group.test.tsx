import { describe, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { RadioGroup } from '../radio-group';
import { Radio } from '../radio';

describe('RadioGroup', () => {
  it('test defaultValue', () => {
    const { queryByLabelText } = render(
      <RadioGroup defaultValue={1} direction="vertical">
        <Radio aria-label="default-option" value={1}>
          A
        </Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
      </RadioGroup>,
    );
    expect(
      (queryByLabelText('default-option') as HTMLInputElement).checked,
    ).toBe(true);
  });
  it('test onChange', () => {
    const fn = vi.fn();
    const { queryByLabelText } = render(
      <RadioGroup onChange={fn} direction="vertical">
        <Radio aria-label="option-1" value={1}>
          A
        </Radio>
        <Radio value={2}>B</Radio>
        <Radio value={3}>C</Radio>
      </RadioGroup>,
    );
    const option = queryByLabelText('option-1');
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(option);
    expect(fn.mock.calls[0][0].target.value).toBe(1);
  });
});
