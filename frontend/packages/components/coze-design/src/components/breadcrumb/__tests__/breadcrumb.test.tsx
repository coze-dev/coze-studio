import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Breadcrumb } from '..';

describe('Breadcrumb', () => {
  it('render correctly', () => {
    const { queryByTestId } = render(
      <Breadcrumb data-testid="Breadcrumb">
        <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
      </Breadcrumb>,
    );
    expect(queryByTestId('Breadcrumb')).not.toBe(null);
  });
});
