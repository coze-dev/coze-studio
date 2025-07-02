import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { IconOfficialLabel } from '@coze-arch/bot-icons';

import styles from './index.module.less';

/**
 * small 16px
 * default 20px
 * large 32px
 */
export type OfficialLabelSize = 'small' | 'default' | 'large';

export interface OfficialLabelProps {
  size?: OfficialLabelSize;
  visible: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const OfficialLabelSizeMap = {
  small: styles.small,
  default: styles.default,
  large: styles.large,
};

export const OfficialLabel: React.FC<OfficialLabelProps> = ({
  size = 'default',
  children,
  visible,
  className,
}) => (
  <div className="relative w-fit h-fit">
    <Tooltip
      spacing={12}
      trigger={visible ? 'hover' : 'custom'}
      content={I18n.t('mkpl_plugin_tooltip_official')}
    >
      {visible ? (
        <IconOfficialLabel
          className={classNames(
            styles['official-label'],
            OfficialLabelSizeMap[size],
            className,
          )}
        />
      ) : null}
    </Tooltip>
    {children}
  </div>
);
