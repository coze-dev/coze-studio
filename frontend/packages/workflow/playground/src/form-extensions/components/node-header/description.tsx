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

import { type FC, useState, useRef } from 'react';

import classnames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography, TextArea, Tag, Divider } from '@coze-arch/coze-design';

import { useNodeRenderScene } from '@/hooks';

import styles from './index.module.less';

const MAX_CNT = 100;

interface DescriptionProps {
  description?: string;
  expanded: boolean;
  isLocalPlugin?: boolean;
  readonly?: boolean;
  onChange: (desc: string) => void;
}

export const Description: FC<DescriptionProps> = props => {
  const {
    description,
    expanded,
    isLocalPlugin = false,
    onChange,
    readonly = false,
  } = props;

  const { concatTestId, getNodeTestId } = useNodeTestId();
  const { isNodeSideSheet } = useNodeRenderScene();
  const [isEdit, setIsEdit] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClick = () => {
    setIsEdit(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleBlur = e => {
    const desc = e.target?.value;
    if (desc && desc.length <= MAX_CNT) {
      onChange?.(desc);
    }
    setIsEdit(false);
  };

  if (!description) {
    return null;
  }

  const localPluginTag = isLocalPlugin ? (
    <>
      <Tag color="cyan" size="mini">
        {I18n.t('local_plugin_label')}
      </Tag>
      <Divider
        layout="vertical"
        className="coz-stroke-primary h-[10px] ml-[4px] mr-[2px]"
      />
    </>
  ) : null;

  if (isEdit) {
    return (
      <div
        className={classnames('pb-[12px] w-full', styles['text-area-wrapper'])}
      >
        <TextArea
          defaultValue={description}
          ref={textareaRef}
          rows={2}
          maxCount={MAX_CNT}
          readonly={readonly}
          onBlur={handleBlur}
        />
      </div>
    );
  } else {
    return (
      <div className="px-0 w-full flex items-center mb-[8px]">
        {localPluginTag}
        <Typography.Text
          size="small"
          data-testid={concatTestId(getNodeTestId(), 'node-description')}
          className={classnames(
            'break-words inline-block px-1 py-0.5 break-all',
            'coz-fg-secondary hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed',
            'rounded-lg',
            {
              '!hidden': !expanded,
              'cursor-pointer': isNodeSideSheet,
            },
          )}
          onClick={handleClick}
          ellipsis={{
            showTooltip: {
              opts: {
                content: description,
                style: { wordBreak: 'break-word' },
              },
            },
            rows: 2,
          }}
        >
          {description}
        </Typography.Text>
      </div>
    );
  }
};
