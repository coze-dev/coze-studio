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

import { Fragment } from 'react';

import cls from 'classnames';
import { KnowledgeE2e } from '@coze-data/e2e';
import { Typography, Space } from '@coze-arch/coze-design';

import { ProcessStatus, type ProcessProgressItemProps } from '../../types';

import styles from './index.module.less';

export const ProcessProgressItem: React.FC<ProcessProgressItemProps> = ({
  className,
  style,
  mainText,
  subText,
  percent = 10,
  percentFormat,
  avatar,
  status,
  actions,
  tipText = '',
}) => {
  const renderProgress = () => {
    if (status === ProcessStatus.Processing) {
      return (
        <div className={styles.progress} style={{ width: `${percent}%` }}></div>
      );
    }
    return null;
  };

  const renderActions = () => {
    if (status === ProcessStatus.Processing) {
      return (
        <span className={styles.percent}>
          {percentFormat ? percentFormat : `${percent}%`}
        </span>
      );
    }

    return (
      <div className={cls(styles.actions, 'process-progress-item-actions')}>
        {Array.isArray(actions) ? (
          <Space spacing="tight">
            {actions.map((action, idx) => (
              <Fragment key={idx}>{action}</Fragment>
            ))}
          </Space>
        ) : null}
      </div>
    );
  };

  return (
    <div
      key={mainText}
      className={cls(
        styles['progress-wrap'],
        'flex justify-between relative mb-[8px]',
        status === ProcessStatus.Failed ? styles['processing-failed'] : '',
        status === ProcessStatus.Processing ? styles.processing : '',
        className,
      )}
      style={style}
    >
      <div
        className={cls(
          styles.content,
          'process-progress-item-content',
          'max-w-[calc(100%-100px)]',
        )}
      >
        <div className={cls('flex items-center', styles.info)}>
          {avatar}
          <div className={cls('pl-[10px] max-w-full')}>
            <div className={styles['main-text']}>
              <Typography.Text
                data-dtestid={`${KnowledgeE2e.CreateUnitListProgressName}.${mainText}`}
                className={'coz-fg-primary text-14px'}
                ellipsis={{
                  showTooltip: {
                    opts: { content: mainText },
                  },
                }}
              >
                {mainText}
              </Typography.Text>
            </div>
            <div className={styles['sub-text']}>
              <div className={styles.desc}>{subText}</div>
              {tipText ? (
                <div className={styles['tip-desc']}>{tipText}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className={cls(styles.right, 'process-progress-item-right')}>
        {renderActions()}
      </div>
      {renderProgress()}
    </div>
  );
};
