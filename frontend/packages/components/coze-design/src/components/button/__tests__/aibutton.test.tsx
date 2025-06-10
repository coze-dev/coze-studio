import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AIButton } from '..';

describe('AIButton', () => {
  it('should render size prop', () => {
    render(<AIButton size="default">AIButton</AIButton>);
    expect(screen.getByText('AIButton').closest('button')).toHaveClass(
      'coz-btn-default',
    );
  });

  it('should render color prop', () => {
    render(<AIButton color="aihglt">AIButton</AIButton>);
    expect(screen.getByText('AIButton').closest('button')).toHaveClass(
      'coz-btn-ai-hglt',
    );
  });

  it('should render disabled prop', () => {
    const { container } = render(
      <AIButton color="aihglt" disabled={true}>
        AIButton
      </AIButton>,
    );
    const element = container.querySelector('.coz-btn-ai-hglt');
    expect(element).toHaveAttribute('aria-disabled', 'true');
  });

  it('should render loading prop', () => {
    const { container } = render(
      <AIButton color="aihglt" loading={true}>
        AIButton
      </AIButton>,
    );
    const element = container.querySelector('.coz-btn-ai-hglt');
    expect(element).toHaveAttribute('aria-disabled', 'true');
    const loadingElement = container.querySelector('.icon-icon');
    expect(loadingElement).toHaveClass('coz-btn-loading');
  });

  it('should render only icon', () => {
    const { container } = render(
      <AIButton color="aiprimary" onlyIcon={true}>
        AIButton
      </AIButton>,
    );
    const element = container.querySelector('.coz-ai-button-text');
    expect(element).toBeNull();
  });
});
