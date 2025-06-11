import '@testing-library/jest-dom';
import { createRef } from 'react';

import { describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { type Avatar as SemiAvatar } from '@/components/semi';

import { Avatar } from '..';

const { AvatarGroup } = Avatar;

describe('Avatar', () => {
  it('should forward ref', () => {
    const ref = createRef<SemiAvatar>();
    render(
      <Avatar alt="coze" ref={ref}>
        coze
      </Avatar>,
    );
    expect(ref.current).not.toBeNull();
    expect(screen.getByText('coze')).toBeInTheDocument();
  });

  it('should populate imgRef', () => {
    const imgRef = createRef<SemiAvatar>();
    const wrapper = render(
      <Avatar ref={imgRef} src="https://placehold.co/460x460" />,
    );

    expect(imgRef.current).not.toBeNull();
    expect(() => wrapper.unmount()).not.toThrow();
  });

  it('should have hover mask', () => {
    const { getByText, container } = render(
      <Avatar alt="coze" hoverMask={true}>
        edit
      </Avatar>,
    );
    fireEvent.mouseOver(getByText('edit'));
    expect(
      container.querySelector('.coz-avatar-editable-mask'),
    ).toBeInTheDocument();
  });

  it('should have given size', () => {
    const { container } = render(<Avatar alt="coze" size="lg" />);
    expect(container.querySelector('span')).toHaveClass('coz-avatar-lg');
  });

  it('should have circle type', () => {
    const { container } = render(<Avatar alt="coze" type="person" />);
    expect(container.querySelector('span')).toHaveClass('semi-avatar-circle');
  });

  it('should have square type', () => {
    const { container } = render(<Avatar alt="coze" type="platform" />);
    expect(container.querySelector('span')).toHaveClass('coz-avatar-platform');
  });

  it('should have given color', () => {
    const { container } = render(<Avatar alt="coze" color="red" />);
    expect(container.querySelector('span')).toHaveClass('coz-avatar-red');
  });

  it('should render a count avatar if "maxCount" is exceeded', () => {
    render(
      <AvatarGroup overlapFrom={'end'} size="small" maxCount={2}>
        <Avatar color="red" alt="Lisa LeBlanc">
          LL
        </Avatar>
        <Avatar alt="Caroline Xiao">CX</Avatar>
        <Avatar color="orange" alt="Rafal Matin">
          RM
        </Avatar>
      </AvatarGroup>,
    );
    const countAvatar = screen.getByText('+1');
    expect(countAvatar).toBeInTheDocument();
  });
});
