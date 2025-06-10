import { type PropsWithChildren } from 'react';

import classNames from 'classnames';

import s from './index.module.less';

// TODO 后续迭代扩展时props可细化
interface ActionBarHoverContainerProps {
  style?: React.CSSProperties;
}

export const ActionBarHoverContainer: React.FC<
  PropsWithChildren<ActionBarHoverContainerProps>
> = ({ children, style }) => (
  <div
    data-testid="chat-area.answer-action.hover-action-bar"
    className={classNames(s.container, ['coz-stroke-primary', 'coz-bg-max'])}
    style={style}
  >
    {children}
  </div>
);
