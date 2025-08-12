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

import React, { useCallback, useMemo, useState, type ReactNode } from 'react';

import { isObject, toString, isNil } from 'lodash-es';
import copy from 'copy-to-clipboard';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy, IconCozCheckMark } from '@coze-arch/coze-design/icons';
import { IconButton, Toast, Tooltip } from '@coze-arch/coze-design';

import { type LogValueType } from '../../types';

import styles from './log-wrap.module.less';

const SPACE = 2;

export const LogWrap: React.FC<
  React.PropsWithChildren<{
    label: string;
    copyable?: boolean;
    source?: LogValueType;
    copyTooltip?: string;
    labelExtra?: ReactNode;
    extra?: ReactNode;
    labelStyle?: React.CSSProperties;
  }>
> = ({
  label,
  copyable = true,
  source,
  copyTooltip,
  children,
  labelExtra,
  extra,
  labelStyle,
}) => {
  const [isSuccess, setSuccess] = useState(false);

  const innerCopyable = useMemo(
    () => copyable && !isNil(source),
    [copyable, source],
  );
  const handleCopy = useCallback(() => {
    try {
      const text = isObject(source)
        ? JSON.stringify(source, undefined, SPACE)
        : toString(source);
      copy(text);
      Toast.success({ content: I18n.t('copy_success'), showClose: false });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
    } catch (e) {
      logger.error(e);
      Toast.error(I18n.t('copy_failed'));
      setSuccess(false);
    }
  }, [source]);

  const renderCopyButton = () =>
    isSuccess ? (
      <Tooltip content={I18n.t('Duplicate_success')}>
        <IconButton
          className={'w-[20px] h-[20px] p-[2px]'}
          size={'mini'}
          color={'secondary'}
          icon={<IconCozCheckMark color={'rgba(107, 109, 117, 1)'} />}
        />
      </Tooltip>
    ) : (
      <Tooltip content={copyTooltip || I18n.t('Copy')}>
        <IconButton
          className={'!w-[20px] !h-[20px] !p-[2px] !text-[16px]'}
          size={'mini'}
          color={'secondary'}
          onClick={handleCopy}
          icon={<IconCozCopy color={'rgba(107, 109, 117, 1)'} />}
        />
      </Tooltip>
    );

  return (
    <div>
      <div style={labelStyle} className={styles['flow-log-detail-label']}>
        <span className={styles['label-text']}>{label}</span>
        {innerCopyable ? renderCopyButton() : null}
        {labelExtra}
        {extra ? <div className="flex flex-1 justify-end">{extra}</div> : null}
      </div>
      <div>{children}</div>
    </div>
  );
};
