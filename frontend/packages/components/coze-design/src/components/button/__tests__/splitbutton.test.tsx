import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IconCozPeopleFill } from '@/components/icon';

import { SplitButton } from '..';

describe('SplitButton', () => {
  it('should render size prop', () => {
    render(<SplitButton size="default">SplitButton</SplitButton>);
    expect(screen.getByText('SplitButton').closest('button')).toHaveClass(
      'coz-btn-default',
    );
  });

  it('should render icon prop', () => {
    const { container } = render(
      <SplitButton size="default" icon={<IconCozPeopleFill />}>
        SplitButton
      </SplitButton>,
    );
    expect(container.querySelector('.icon-icon')).toBeInTheDocument();
  });

  it('should render loading prop', () => {
    const { container } = render(
      <SplitButton size="default" loading={true} icon={<IconCozPeopleFill />}>
        SplitButton
      </SplitButton>,
    );
    expect(container.querySelectorAll('.coz-btn-loading')).toHaveLength(1);
  });
});
