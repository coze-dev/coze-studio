import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Content } from '..';

describe('Content', () => {
  it('Content should render', () => {
    const { queryByText } = render(<Content>Content</Content>);

    expect(queryByText('Content')).toHaveClass('coz-common-content');
  });
});
