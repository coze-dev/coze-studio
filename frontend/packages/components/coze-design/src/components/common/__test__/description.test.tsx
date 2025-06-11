import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Description } from '..';

describe('Description', () => {
  it('Description should render', () => {
    const { queryByText } = render(<Description>Description</Description>);

    expect(queryByText('Description')).toHaveClass('coz-common-description');
  });
});
