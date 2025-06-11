import '@testing-library/jest-dom';
import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Avatar } from '@/components/avatar';

import { Badge } from '..';

describe('Badge', () => {
  it('should has className coz-badge', () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.querySelector('.coz-badge')).toBeInTheDocument();
  });

  it('should has given content', () => {
    render(
      <Badge type="alt" count="Beta">
        Badge
      </Badge>,
    );
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should has className dot', () => {
    const { container } = render(
      <Badge type="mini">
        <Avatar color="green" type="bot" size="lg">
          BD
        </Avatar>
      </Badge>,
    );
    expect(container.querySelector('.semi-badge-dot')).toBeInTheDocument();
  });

  it('should has count text', () => {
    render(
      <Badge type="default" count={1000} overflowCount={999}>
        <Avatar color="green" type="bot" size="lg">
          BD
        </Avatar>
      </Badge>,
    );
    expect(screen.getByText('999+')).toBeInTheDocument();
  });
});
