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

import type React from 'react';
import { useCallback } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Popover, Typography, Tag } from '@coze-arch/coze-design';

import { type ProblemItem } from '../../types';

import styles from './base-item.module.less';

type BaseItemWrapProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const BaseItemWrap: React.FC<
  React.PropsWithChildren<BaseItemWrapProps>
> = ({ className, ...props }) => (
  <div className={cls(styles['base-item-wrap'], className)} {...props}></div>
);

interface BaseItemProps {
  problem: ProblemItem;
  title: string;
  icon: React.ReactNode;
  popover?: React.ReactNode;
  onClick: (p: ProblemItem) => void;
}

const { Text } = Typography;

export const BaseItem: React.FC<BaseItemProps> = ({
  problem,
  title,
  icon,
  popover,
  onClick,
}) => {
  const { errorInfo, errorLevel } = problem;

  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <BaseItemWrap className={styles['base-item']} onClick={handleClick}>
      <div className={styles['item-icon']}>{icon}</div>
      <div className={styles['item-content']}>
        <div className={styles['item-title']}>
          <Text weight={500}>{title}</Text>
          {errorLevel === 'warning' && (
            <Tag color="primary">{I18n.t('workflow_exception_ignore_tag')}</Tag>
          )}
          {popover ? (
            <Popover content={popover} position="top">
              <IconCozInfoCircle className={styles['item-popover']} />
            </Popover>
          ) : null}
        </div>
        <div className={styles['item-info']}>
          <Text
            size="small"
            className={
              errorLevel === 'error' ? 'coz-fg-hglt-red' : 'coz-fg-hglt-yellow'
            }
          >
            {errorInfo}
          </Text>
        </div>
      </div>
    </BaseItemWrap>
  );
};

export const TextItem: React.FC<{
  problem: ProblemItem;
  onClick: (p: ProblemItem) => void;
}> = ({ problem, onClick }) => {
  const { errorInfo, errorLevel } = problem;

  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <BaseItemWrap className={styles['text-item']} onClick={handleClick}>
      <Text
        size="small"
        className={
          errorLevel === 'error' ? 'coz-fg-hglt-red' : 'coz-fg-hglt-yellow'
        }
      >
        {errorInfo}
      </Text>
    </BaseItemWrap>
  );
};
