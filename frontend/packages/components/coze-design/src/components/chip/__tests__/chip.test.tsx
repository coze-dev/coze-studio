import '@testing-library/jest-dom';
import { describe, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

import { Chip } from '..';

describe('Chip', () => {
  it('renders correctly', () => {
    const { baseElement } = render(<Chip>chip</Chip>);
    const comp = baseElement.querySelector<HTMLDivElement>('.coz-chip');
    expect(comp).not.toBeNull();
  });

  it('renders with different sizes', () => {
    const { container } = render(<Chip size="mini">chip</Chip>);
    const comp = container.querySelector('.coz-chip');
    expect(comp).toHaveClass('h-20px');
    expect(comp).toHaveClass('rounded-mini');
  });

  it('renders with different colors', () => {
    const { container } = render(<Chip color="brand">chip</Chip>);
    const comp = container.querySelector('.coz-chip');
    expect(comp).toHaveClass('coz-mg-hglt');
    expect(comp).toHaveClass('coz-fg-hglt');
  });

  it('renders in loading state', () => {
    const { container } = render(<Chip loading>chip</Chip>);
    const loadingIcon = container.querySelector('.animate-spin');
    expect(loadingIcon).not.toBeNull();
  });

  it('renders in disabled state', () => {
    const { container } = render(<Chip disabled>chip</Chip>);
    const comp = container.querySelector('.coz-chip');
    expect(comp).toHaveClass('cursor-not-allowed');
    expect(comp).toHaveClass('coz-fg-hglt-dim');
  });

  it('renders with remove style and handles remove click', () => {
    const handleRemove = vi.fn();
    const { container } = render(
      <Chip chipStyle="remove" onClickRemove={handleRemove}>
        chip
      </Chip>,
    );

    const removeIcon = container.querySelector('.icon-icon-coz_cross');
    expect(removeIcon).not.toBeNull();

    fireEvent.click(removeIcon!);
    expect(handleRemove).toHaveBeenCalled();
  });

  it('renders with select style', () => {
    const { container } = render(<Chip chipStyle="select">chip</Chip>);
    const arrowIcon = container.querySelector('.icon-icon-coz_arrow_down');
    expect(arrowIcon).not.toBeNull();
  });

  it('does not trigger remove click when disabled', () => {
    const handleRemove = vi.fn();
    const { container } = render(
      <Chip chipStyle="remove" disabled onClickRemove={handleRemove}>
        chip
      </Chip>,
    );

    const removeIcon = container.querySelector('svg');
    expect(removeIcon).not.toBeNull();
    fireEvent.click(removeIcon!);
    expect(handleRemove).not.toHaveBeenCalled();
  });
});
