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

import React, { useRef } from 'react';

import cls from 'classnames';
import { useHover } from 'ahooks';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Typography, Spin } from '@coze-arch/coze-design';
import type { RenderFileItemProps } from '@coze-arch/bot-semi/Upload';

import styles from './custom-file-item.module.less';

interface CustomOperationProps extends RenderFileItemProps {
  hover?: boolean;
}

export const CustomOperation = (props: CustomOperationProps) => {
  if (props.status === 'uploading') {
    if (!props.percent) {
      return (
        <Spin
          wrapperClassName={styles['file-icon-loading']}
          style={{
            width: 14,
            height: 14,
            lineHeight: `${14}px`,
          }}
          spinning
        />
      );
    }

    return (
      <span className={'text-[12px] coz-fg-secondary'}>{props.percent}%</span>
    );
  }

  if (props.status === 'success' && !props.hover) {
    return <span className={'text-[12px] coz-fg-secondary'}>{props.size}</span>;
  }

  return (
    <IconButton
      color={'secondary'}
      size={'small'}
      icon={<IconCozTrashCan />}
      onClick={props.onRemove}
    />
  );
};

export default function CustomFileItem(props: RenderFileItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hover = useHover(ref);

  return (
    <div className={'w-full custom-upload-file-item'}>
      <div
        ref={ref}
        className={cls(
          'w-full h-full flex items-center relative',
          styles.container,
        )}
      >
        {props.previewFile?.(props)}

        <Typography.Text
          ellipsis={{
            showTooltip: {
              opts: { content: props.name },
            },
          }}
          className={styles.name}
        >
          {props.name}
        </Typography.Text>

        <span className={'text-[12px] flex items-center'}>
          <CustomOperation {...props} hover={hover} />
        </span>

        {props.status === 'uploading' && (
          <div className={styles.progress}>
            <div
              className={styles['progress-inner']}
              style={{
                width: `${props.percent || 0}%`,
              }}
            ></div>
          </div>
        )}
      </div>
      {props.validateMessage ? (
        <div className={'coz-fg-hglt-red text-[12px]'}>
          {props.validateMessage}
        </div>
      ) : null}
    </div>
  );
}
