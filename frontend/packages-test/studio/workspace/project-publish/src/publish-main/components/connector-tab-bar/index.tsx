import { type CSSProperties, forwardRef, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { Badge, Button } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface TabbarItemProps {
  onClick: () => void;
  isActive: boolean;
  selectedConnectorCount: number;
}
export const ConnectorTabbarItem: React.FC<
  PropsWithChildren<TabbarItemProps>
> = ({ onClick, isActive, children, selectedConnectorCount }) => (
  <Button
    onClick={onClick}
    color={isActive ? 'highlight' : 'secondary'}
    className="!px-8px !font-medium"
  >
    {children}
    {selectedConnectorCount > 0 ? (
      <Badge
        countClassName={classNames(
          !isActive && '!coz-mg-plus !coz-fg-secondary',
          '!font-medium',
        )}
        className="ml-4px"
        count={selectedConnectorCount}
        type="alt"
      />
    ) : null}
  </Button>
);

export interface ConnectorTabbarProps {
  className?: string;
  style?: CSSProperties;
}

export const ConnectorTabbar = forwardRef<
  HTMLDivElement,
  PropsWithChildren<ConnectorTabbarProps>
>(({ className, style, children }, ref) => (
  <div
    ref={ref}
    className={classNames(
      // ! 80px 高度影响 styles.mask 计算
      'flex items-center gap-x-8px h-[80px] relative',
      styles.mask,
      className,
    )}
    style={style}
  >
    {children}
  </div>
));
