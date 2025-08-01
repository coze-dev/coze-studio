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

import React from 'react';

import cls from 'classnames';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowRight,
  IconCozCheckMarkFill,
} from '@coze-arch/coze-design/icons';
import { Avatar, Tag, Typography } from '@coze-arch/coze-design';
import { useHover } from '@coze-arch/hooks';

import type { IBotSelectOption } from '@/components/bot-project-select/types';

interface OptionItemProps extends IBotSelectOption {
  checked?: boolean;
  disabled?: boolean;
}

export default function OptionItem({
  disabled,
  checked,
  avatar,
  name,
  type,
}: OptionItemProps) {
  const [ref, isHover] = useHover<HTMLDivElement>();

  const renderOperate = () => {
    if (isHover && !disabled) {
      return (
        <div className={'flex items-center coz-fg-secondary flex-shrink-0'}>
          <span className={'text-[12px]'}>
            {I18n.t('variable_binding_continue', {}, '继续')}
          </span>
          <IconCozArrowRight className="text-[12px] ml-2px" />
        </div>
      );
    }

    return type === IntelligenceType.Project ? (
      <Tag size="mini" color="primary" className={'flex-shrink-0'}>
        {I18n.t('wf_chatflow_106')}
      </Tag>
    ) : (
      <Tag size="mini" color="primary" className={'flex-shrink-0'}>
        {I18n.t('wf_chatflow_107')}
      </Tag>
    );
  };

  return (
    <div
      ref={ref}
      className={cls('flex w-full items-center pl-8px pr-8px pt-2px pb-2px')}
    >
      {checked ? (
        <IconCozCheckMarkFill className="text-[16px] mr-8px coz-fg-hglt flex-shrink-0" />
      ) : (
        <div className={'w-16px h-16px mr-8px flex-shrink-0'} />
      )}

      <Avatar
        style={{ flexShrink: 0, marginRight: 8, width: 16, height: 16 }}
        shape="square"
        src={avatar}
      />
      <div
        className="flex"
        style={{ flexGrow: 1, flexShrink: 1, overflow: 'hidden' }}
      >
        <Typography.Text
          ellipsis={{ showTooltip: true }}
          style={{
            fontSize: 12,
            color: '#1D1C23',
            fontWeight: 400,
          }}
        >
          {name}
        </Typography.Text>
      </div>

      {renderOperate()}
    </div>
  );
}
