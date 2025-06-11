import { type PropsWithChildren, type ReactNode } from 'react';

import cs from 'classnames';
import { type TabsProps } from '@coze-arch/bot-semi/Tabs';
import { Tabs } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface BotListHeaderProps extends TabsProps {
  toolbar?: ReactNode;
  containerClass?: string;
}

export const ListTab: React.FC<PropsWithChildren<BotListHeaderProps>> = ({
  children,
  toolbar,
  containerClass,
  ...props
}) => (
  <Tabs
    {...props}
    tabPaneMotion={false}
    type="button"
    // eslint-disable-next-line @typescript-eslint/naming-convention -- react 组件
    renderTabBar={(innerProps, Node) => (
      <div className={cs(s.header, containerClass)}>
        <Node {...innerProps} />
        <div className={s['tool-bar']}>{toolbar}</div>
      </div>
    )}
  >
    {children}
  </Tabs>
);
