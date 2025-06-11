import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Checkbox } from '..';

describe('Checkbox', () => {
  it('render correctly', () => {
    const { container } = render(<Checkbox>Coze Design</Checkbox>);
    expect(container.getElementsByClassName('semi-checkbox')).toHaveLength(1);
  });
});
