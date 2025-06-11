import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { IconCozPeopleFill } from '@/components/icon';

import { Button, IconButton } from '..';

describe('Button', () => {
  it('should generate id prop', () => {
    render(<Button>Button</Button>);
    expect(screen.getByText('Button')).toHaveProperty('id');
  });

  it('should disable when inside disabled fieldset', () => {
    render(
      <fieldset disabled>
        <Button>Button</Button>
      </fieldset>,
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should add svg spinner', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('should render as a button', () => {
    render(<Button color="secondary">Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should render as a IconButton', () => {
    const { container } = render(
      <IconButton
        color="primary"
        size="small"
        iconPosition="left"
        icon={<IconCozPeopleFill className="fill-foreground-5" />}
      >
        Button
      </IconButton>,
    );
    const element = container.querySelector('.coz-icon-button');
    expect(element).toBeInTheDocument();
  });

  it('should not render badge by default', () => {
    const { container } = render(<Button>Button</Button>);
    expect(container.querySelector('.coz-btn-badge')).not.toBeInTheDocument();
  });

  it('should render badge when showBadge is true', () => {
    const { container } = render(<Button showBadge>Button</Button>);
    expect(container.querySelector('.coz-btn-badge')).toBeInTheDocument();
  });

  it('should use button color for badge by default', () => {
    const { container } = render(
      <Button showBadge color="primary">
        Button
      </Button>,
    );
    expect(
      container.querySelector('.coz-btn-badge-primary'),
    ).toBeInTheDocument();
  });

  it('should use custom badge color when specified', () => {
    const { container } = render(
      <Button showBadge badgeColor="unset" color="primary">
        Button
      </Button>,
    );
    expect(container.querySelector('.coz-btn-badge-unset')).toBeInTheDocument();
  });
});
