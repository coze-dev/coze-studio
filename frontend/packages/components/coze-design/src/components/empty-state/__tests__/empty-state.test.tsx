import { describe, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { EmptyState } from '..';

describe('EmptyState', () => {
  it('should has className coz-empty-state', () => {
    const { container } = render(<EmptyState />);
    expect(container.getElementsByClassName('coz-empty-state')).toHaveLength(1);
  });

  it('test retry button', () => {
    const fn = vi.fn();
    const { queryByText } = render(
      <EmptyState buttonText="Retry" onButtonClick={fn} />,
    );
    const btn = queryByText('Retry');
    expect(btn).not.toBe(null);
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(btn);
    expect(fn).toBeCalled();
  });

  it('test render extra', () => {
    const testId = 'test-extra';
    const { queryAllByTestId } = render(
      <EmptyState extra={<div data-testid={testId}>extra</div>} />,
    );
    expect(queryAllByTestId(testId)).not.toBe(null);
  });
});
