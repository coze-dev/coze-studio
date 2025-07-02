import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { CaseBlock } from '../../src/components/setting-tips/case-block';

describe('CaseBlock', () => {
  const mockLabel = 'Test Label';
  const mockContent = 'Test Content';

  it('renders label correctly', () => {
    render(<CaseBlock label={mockLabel} content={mockContent} />);
    expect(screen.getByText(mockLabel)).toBeInTheDocument();
  });

  it('renders content correctly', () => {
    render(<CaseBlock label={mockLabel} content={mockContent} />);
    expect(screen.getByText(mockContent)).toBeInTheDocument();
  });

  it('renders complex content correctly', () => {
    const complexContent = (
      <div data-testid="complex-content">
        <span>Child 1</span>
        <span>Child 2</span>
      </div>
    );

    render(<CaseBlock label={mockLabel} content={complexContent} />);
    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<CaseBlock label={mockLabel} content={mockContent} />);

    // Check for flex container classes
    const container = screen.getByText(mockLabel).parentElement;
    expect(container).toHaveClass('flex', 'flex-col');

    // Check for gap class
    expect(container).toHaveClass('gap-[4px]');
  });
});
