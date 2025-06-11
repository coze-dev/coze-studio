import { type PropsWithChildren } from 'react';

import s from './index.module.less';

interface ActionBarContainerProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const ActionBarContainer: React.FC<
  PropsWithChildren<ActionBarContainerProps>
> = ({ leftContent, rightContent, children }) => (
  <div className={s.container}>
    <div className={s['icon-container']}>
      <div
        data-testid="chat-area.answer-action.left-content"
        className={s['left-content']}
      >
        {leftContent}
      </div>
      <div
        data-testid="chat-area.answer-action.right-content"
        className={s['right-content']}
      >
        {rightContent}
      </div>
    </div>
    {children}
  </div>
);

ActionBarContainer.displayName = 'ActionBarContainer';
