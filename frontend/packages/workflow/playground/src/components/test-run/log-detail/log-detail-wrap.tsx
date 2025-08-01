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

import React, { useCallback } from 'react';

import { isObject, toString } from 'lodash-es';
import copy from 'copy-to-clipboard';
import cls from 'classnames';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast, Tooltip, Typography } from '@coze-arch/coze-design';
import { UIIconButton, UITag } from '@coze-arch/bot-semi';
import { IconCopy } from '@coze-arch/bot-icons';

import { type LogValueType } from '../types';

import styles from './log-detail-wrap.module.less';

const { Text } = Typography;

const SPACE = 2;

export const LogDetailWrap: React.FC<
  React.PropsWithChildren<{
    label: string;
    size?: 'primary' | 'secondary';
    copyable?: boolean;
    source?: LogValueType;
    copyTooltip?: string;
    mockInfo?: {
      mockSetName?: string;
      isHit: boolean;
    };
  }>
> = ({
  label,
  size,
  copyable = true,
  source,
  copyTooltip,
  children,
  mockInfo,
}) => {
  const handleCopy = useCallback(() => {
    try {
      const text = isObject(source)
        ? JSON.stringify(source, undefined, SPACE)
        : toString(source);
      copy(text);
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
    } catch (e) {
      logger.error(e);
      Toast.error(I18n.t('copy_failed'));
    }
  }, [source]);
  return (
    <>
      <div
        className={cls(styles['flow-log-detail-label'], {
          [styles.small]: size === 'secondary',
        })}
      >
        <span className={styles['label-text']}>{label}</span>
        {copyable ? (
          <Tooltip content={copyTooltip}>
            <UIIconButton
              iconSize="small"
              icon={<IconCopy />}
              onClick={handleCopy}
            />
          </Tooltip>
        ) : null}
        {mockInfo?.isHit ? (
          <UITag>
            <Text>{I18n.t('mockset')}:</Text>
            <Text
              ellipsis={{
                showTooltip: {
                  opts: { style: { wordBreak: 'break-word' } },
                },
              }}
            >
              {mockInfo.mockSetName}
            </Text>
          </UITag>
        ) : null}
      </div>
      {children}
    </>
  );
};
