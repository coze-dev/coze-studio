import FlipMove from 'react-flip-move';
import React, { PropsWithChildren } from 'react';

export type UIHeaderProps = PropsWithChildren<{
  flipMoveProps?: FlipMove.FlipMoveProps;
}>;

const defaultAnimation: Record<string, FlipMove.AnimationProp> = {
  appear: 'fade',
  enter: {
    from: {
      transform: 'translateY(15px)',
      opacity: '0',
    },
    to: {
      transform: '',
    },
  },
  leave: {
    from: {
      transform: '',
    },
    to: {
      transform: 'translateY(15px)',
      opacity: '0',
    },
  },
};
export const UIFlipMove: React.FC<UIHeaderProps> = ({
  children,
  flipMoveProps,
}) => (
  <>
    <FlipMove
      duration={200}
      easing="ease-out"
      appearAnimation={defaultAnimation.appear}
      enterAnimation={defaultAnimation.enter}
      leaveAnimation={defaultAnimation.leave}
      {...flipMoveProps}
    >
      {children}
    </FlipMove>
  </>
);
