import React from 'react';

import classNames from 'classnames';
import { Tooltip, Avatar } from '@coze-arch/coze-design';

import { type EnumImageModelLabelProps } from './types';

import styles from './enum-image-model-label.module.less';

export function EnumImageModelLabel({
  thumbnail,
  label,
  tooltip,
  disabled = false,
  disabledTooltip,
}: EnumImageModelLabelProps) {
  let content = (
    <div className={styles.label}>
      <Avatar
        className={classNames(
          styles.thumbnail,
          'wf-enum-image-model-thumbnail',
        )}
        style={{ width: 16, height: 16 }}
        shape="square"
        src={thumbnail}
      />
      <span className={styles.content}>{label}</span>
    </div>
  );

  if (disabled && disabledTooltip) {
    tooltip = disabledTooltip;
  }

  if (tooltip) {
    content = (
      <Tooltip content={tooltip} position="left" spacing={40}>
        {content}
      </Tooltip>
    );
  }

  return content;
}
