import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { SubTitle } from '..';

describe('SubTitle', () => {
  it('SubTitle should render', () => {
    const { queryByText } = render(<SubTitle>SubTitle</SubTitle>);

    expect(queryByText('SubTitle')).toHaveClass('coz-common-subtitle');
  });
});
