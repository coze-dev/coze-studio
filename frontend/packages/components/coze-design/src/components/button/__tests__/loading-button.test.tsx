import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { IconCozPeopleFill } from '@/components/icon';

import { Button, IconButton, LoadingButton } from '..';

describe('LoadingButton', () => {
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

  it('should loading after click - toast string', async () => {
    const { container } = render(
      <LoadingButton
        color="secondary"
        loadingToast="loading toast string"
        onClick={() =>
          new Promise<void>(resolve => {
            setTimeout(() => resolve(), 1000);
          })
        }
      >
        LoadingButton
      </LoadingButton>,
    );
    fireEvent.click(screen.getByText('LoadingButton'));
    expect(screen.getByText('loading toast string')).toBeInTheDocument();
    expect(container.querySelector('.coz-btn-loading')).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(container.querySelector('.coz-btn-loading')).not.toBeInTheDocument();
  });

  it('should loading after click - toast object', async () => {
    const { container } = render(
      <LoadingButton
        color="secondary"
        loadingToast={{
          content: 'loading toast object',
        }}
        onClick={() =>
          new Promise<void>(resolve => {
            setTimeout(() => resolve(), 1000);
          })
        }
      >
        LoadingButton
      </LoadingButton>,
    );
    fireEvent.click(screen.getByText('LoadingButton'));
    expect(screen.getByText('loading toast object')).toBeInTheDocument();
    expect(container.querySelector('.coz-btn-loading')).toBeInTheDocument();
    await new Promise(resolve => setTimeout(resolve, 2000));
    expect(container.querySelector('.coz-btn-loading')).not.toBeInTheDocument();
  });
});
