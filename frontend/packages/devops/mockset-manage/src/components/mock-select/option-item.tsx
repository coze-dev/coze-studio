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

import { useState, type CSSProperties } from 'react';

import classNames from 'classnames';
import { Typography, UIIconButton } from '@coze-arch/bot-semi';
import { IconDeleteOutline, IconEdit } from '@coze-arch/bot-icons';
import { IconEyeOpened, IconUploadError } from '@douyinfe/semi-icons';

import { MockSetStatus } from '../../interface';

import styles from './option-item.module.less';

export interface MockSetItemProps {
  name: string;
  onDelete?: () => void;
  onView?: () => void;
  status?: MockSetStatus;
  creatorName?: string;
  viewOnly?: boolean;
  disableCreator?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const MockSetItem = ({
  name,
  onDelete,
  onView,
  status = MockSetStatus.Normal,
  creatorName,
  viewOnly,
  disableCreator,
  className,
  style,
}: MockSetItemProps) => {
  const [isHover, setIsHover] = useState(false);
  const renderExtraInfo = () => {
    if (isHover) {
      return (
        <div
          className={styles['operation-icon']}
          onClick={e => e.stopPropagation()}
        >
          {viewOnly ? (
            <UIIconButton onClick={onView} icon={<IconEyeOpened />} />
          ) : (
            <>
              <UIIconButton
                onClick={onView}
                icon={<IconEdit />}
                wrapperClass="mr-[4px]"
              />
              <UIIconButton onClick={onDelete} icon={<IconDeleteOutline />} />
            </>
          )}
        </div>
      );
    }
    return disableCreator ? null : (
      <Typography.Text
        ellipsis={{
          showTooltip: {
            opts: { content: creatorName },
          },
        }}
        className={styles['creator-name']}
      >
        {creatorName}
      </Typography.Text>
    );
  };
  return (
    <div
      className={classNames(styles['mock-select-item'], className)}
      style={style}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => setIsHover(false)}
    >
      <span className={styles['mock-main-info']}>
        {status !== MockSetStatus.Normal && (
          <IconUploadError className={styles['status-icon']} />
        )}
        <Typography.Text ellipsis={{}} className={styles['mock-name']}>
          {name}
        </Typography.Text>
      </span>
      <div className={styles['mock-extra-info']}>{renderExtraInfo()}</div>
    </div>
  );
};
