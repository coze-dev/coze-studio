import '@testing-library/jest-dom';
import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Tooltip } from '@/components/tooltip';
import { Button } from '@/components/button';
describe('Tooltip', () => {
  const contentLabel = 'This is a tooltip.';
  it('should show and hide', async () => {
    render(
      <Tooltip content={contentLabel} trigger="hover">
        <Button>COZTooltip</Button>
      </Tooltip>,
    );
    const button = await screen.findByText('COZTooltip');
    expect(button).toBeInTheDocument();
    fireEvent.mouseOver(button);
    const tooltipShow = await screen.findByText(contentLabel);
    expect(tooltipShow).toBeInTheDocument();
    fireEvent.mouseLeave(button);
    await waitFor(() => {
      const tooltipHide = screen.queryByText(contentLabel);
      expect(
        // @ts-expect-error -- linter-disable-autofix
        tooltipHide.closest('.semi-tooltip-animation-hide'),
      ).toBeInTheDocument();
    });
  });
});
