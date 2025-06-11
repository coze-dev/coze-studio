import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Checkbox, CheckboxGroup } from '..';

describe('CheckboxGroup', () => {
  it('render correctly', () => {
    const { container } = render(
      <CheckboxGroup>
        <Checkbox value={1}>A</Checkbox>
        <Checkbox value={2}>B</Checkbox>
        <Checkbox value={3}>C</Checkbox>
      </CheckboxGroup>,
    );
    expect(container.getElementsByClassName('semi-checkboxGroup')).toHaveLength(
      1,
    );
    expect(container.getElementsByClassName('semi-checkbox')).toHaveLength(3);
  });
});
