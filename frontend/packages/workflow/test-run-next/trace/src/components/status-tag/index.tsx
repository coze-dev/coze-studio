/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useMemo } from 'react';

import { clsx } from 'clsx';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCheckMarkCircleFillPalette,
  IconCozCrossCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { Tag } from '@coze-arch/coze-design';

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
