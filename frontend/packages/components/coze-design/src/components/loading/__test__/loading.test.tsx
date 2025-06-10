/* eslint-disable @typescript-eslint/naming-convention */
import '@testing-library/jest-dom';
import { createRef, useState } from 'react';

import { describe, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { type Spin } from '@douyinfe/semi-ui';

import { Loading } from '..';

const ToggleLoadingComponent = () => {
  const [loading, setLoading] = useState(true);
  const handleToggleLoading = () => {
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };
  return (
    <div>
      <Loading loading={loading} />
      <button onClick={handleToggleLoading}>Toggle</button>
    </div>
  );
};

describe('Loading', () => {
  it('should forward ref', () => {
    const ref = createRef<Spin>();
    render(<Loading ref={ref} loading={true} />);
    expect(ref.current).not.toBeNull();
  });

  it('renders a variant', () => {
    const { container } = render(<Loading loading={true} />);
    const element = container.querySelector('.coz-loading');
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('coz-fg-secondary');
  });

  it('renders a size', () => {
    const { container } = render(<Loading loading={true} size="middle" />);
    const element = container.querySelector('.coz-loading-middle');
    expect(element).toHaveClass('semi-spin-middle');
  });

  it('renders a color', () => {
    const { container } = render(<Loading loading={true} color="blue" />);
    const element = container.querySelector('.coz-loading');
    expect(element).toHaveClass('coz-fg-hglt');
  });

  it('renders a variant with label', () => {
    render(
      <Loading
        loading={true}
        size="middle"
        label="正在加载中"
        labelSize="normal"
        className="flex w-auto"
      />,
    );
    const element = screen.getByText('正在加载中');
    expect(element).toBeInTheDocument();
  });

  it('should display loading toggle styles', async () => {
    const { container } = render(<ToggleLoadingComponent />);
    const element = container.querySelector('.coz-loading-wrapper');
    expect(element).toBeInTheDocument();
    fireEvent.click(screen.getByText('Toggle'));
    expect(element).toHaveClass('semi-spin');
    await act(() => new Promise(resolve => setTimeout(resolve, 200)));
    expect(element).toHaveClass('semi-spin-hidden');
  });
});
