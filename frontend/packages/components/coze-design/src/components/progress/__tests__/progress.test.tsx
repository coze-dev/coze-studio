import '@testing-library/jest-dom';
import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Progress } from '..';

describe('Progress', () => {
  it('should has className coz-progress', () => {
    const { container } = render(<Progress />);
    expect(container.querySelectorAll('.coz-progress')).toHaveLength(1);
  });

  it('should have given type', () => {
    render(<Progress percent={50} type="circle" />);
    expect(screen.getByRole('progressbar')).toHaveClass('coz-progress-circle');
  });

  it('should have given size', () => {
    render(<Progress percent={50} type="line" size="default" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'style',
      'height: 4px;',
    );
  });

  it('should have given value', () => {
    const { container } = render(<Progress percent={50} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(container.querySelector('.semi-progress-track-inner')).toHaveStyle(
      'width: 50%',
    );
  });
});
