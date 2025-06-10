import { type FC, type CSSProperties } from 'react';

import classnames from 'classnames';
import { Image } from '@coze/coze-design';

import styles from './node-icon-outlined.module.less';
export interface NodeIconOutlinedProps {
  borderRadius?: CSSProperties['borderRadius'];
  size?: number;
  icon?: string;
  hideOutline?: boolean;
  outlineColor?: string;
  style?: CSSProperties;
  className?: string;
}
export const NodeIconOutlined: FC<NodeIconOutlinedProps> = ({
  icon,
  size = 18,
  hideOutline,
  borderRadius = 'var(--coze-3)',
  outlineColor = 'var(--coz-stroke-primary)',
  className,
  style,
}) => (
  <div
    className={classnames(className, styles['node-icon-wrapper'])}
    style={{ borderRadius, width: size, height: size, ...style }}
  >
    <Image
      className={styles['node-icon']}
      style={{ borderRadius }}
      width={size}
      height={size}
      src={icon}
      preview={false}
    />
    {hideOutline ? null : (
      <div
        className={styles['node-icon-border']}
        style={{
          borderRadius,
          boxShadow: `inset 0 0 0 1px ${outlineColor}`,
        }}
      ></div>
    )}
  </div>
);
