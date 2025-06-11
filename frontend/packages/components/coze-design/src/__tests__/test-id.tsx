import { type FC } from 'react';

import { it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { LocaleProviderContainer } from './locale-provider-containner';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const testDataTestId = (Component: FC, displayName: string) => {
  it(`${displayName} should render dom with data-testid`, () => {
    const testId = `test-${displayName.toLowerCase()}`;
    const { container } = render(
      <LocaleProviderContainer>
        <Component data-testid={testId} />
      </LocaleProviderContainer>,
    );
    expect(container.querySelector(`[data-testid="${testId}"]`)).not.toBeNull();
  });
};
