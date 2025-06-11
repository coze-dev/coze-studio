import React, { useMemo } from 'react';

import { clsx } from 'clsx';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFillPalette,
  IconCozCrossCircleFillPalette,
} from '@coze/coze-design/icons';
import { Tag } from '@coze/coze-design';

interface StatusTagProps {
  status?: number;
  className?: string;
  type?: 'normal' | 'icon';
}

export const StatusIcon: React.FC<{ status?: number; className?: string }> = ({
  status,
  className,
}) =>
  status === 0 ? (
    <IconCozCheckMarkCircleFillPalette
      className={clsx(className, 'coz-fg-hglt-green')}
    />
  ) : (
    <IconCozCrossCircleFillPalette
      className={clsx(className, 'coz-fg-hglt-red')}
    />
  );

export const StatusTag: React.FC<StatusTagProps> = ({
  status,
  className,
  type = 'normal',
}) => {
  const children = useMemo(() => {
    if (type === 'icon') {
      return null;
    }
    return status === 0
      ? I18n.t('debug_asyn_task_task_status_success')
      : I18n.t('debug_asyn_task_task_status_failed');
  }, [status, type]);

  return (
    <Tag
      prefixIcon={
        status === 0 ? (
          <IconCozCheckMarkCircleFillPalette />
        ) : (
          <IconCozCrossCircleFillPalette />
        )
      }
      color={status === 0 ? 'green' : 'red'}
      className={className}
      size="mini"
    >
      {children}
    </Tag>
  );
};
