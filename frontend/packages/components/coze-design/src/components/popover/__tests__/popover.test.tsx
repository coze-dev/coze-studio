import '@testing-library/jest-dom';

import { describe, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { Popover } from '@/components/popover';
import { Button } from '@/components/button';

describe('Popover', () => {
  it('should render content', async () => {
    const content = 'hi, COZPopover';
    render(
      <Popover
        content={content}
        trigger="click"
        position="bottom"
        showArrow
        style={{
          backgroundColor: 'var(--coz-fg-hglt-green)',
          borderColor: 'var(--coz-fg-hglt-green)',
          color: 'var(--coz-fg-hglt-plus)',
          borderWidth: 1,
          borderStyle: 'solid',
        }}
      >
        <Button color="primary">click me</Button>
      </Popover>,
    );
    const button = await screen.findByText('click me');
    fireEvent.click(button);
    const allByTitle = await screen.findAllByText(content);
    expect(allByTitle).toHaveLength(1);
    allByTitle.forEach(toastContent => {
      const cozPopoverElement = toastContent.closest('.coz-popover');
      expect(cozPopoverElement).toBeInTheDocument();
    });
  });
});
