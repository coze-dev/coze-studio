import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

import { Enum } from './enum';

const mockProps = {
  value: '',
  onChange: vi.fn(),
  options: [
    { label: '选项一', value: 1 },
    { label: '选项一', value: 2 },
  ],
};

describe('Enum Setter', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<Enum {...mockProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
