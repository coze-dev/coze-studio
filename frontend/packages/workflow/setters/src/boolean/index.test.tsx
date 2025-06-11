import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { Boolean } from './boolean';

const mockProps = {
  value: false,
  onChange: vi.fn(),
};

describe('Boolean Setter', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Boolean {...mockProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
