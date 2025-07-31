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

import React, { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozTextAlignCenter,
  IconCozTextAlignLeft,
  IconCozTextAlignRight,
} from '@coze-arch/coze-design/icons';
import { Select, type RenderSelectedItemFn } from '@coze-arch/coze-design';

import { TextAlign as TextAlignEnum } from '../../typings';

interface IProps {
  value: TextAlignEnum;
  onChange: (value: TextAlignEnum) => void;
}
export const TextAlign: FC<IProps> = props => {
  const { value, onChange } = props;

  return (
    <Select
      // borderless
      className="border-0 hover:border-0 focus:border-0"
      value={value}
      onChange={v => {
        onChange(v as TextAlignEnum);
      }}
      optionList={[
        {
          icon: <IconCozTextAlignLeft className="text-[16px]" />,
          label: I18n.t('card_builder_hover_align_left'),
          value: TextAlignEnum.LEFT,
        },
        {
          icon: <IconCozTextAlignCenter className="text-[16px]" />,
          label: I18n.t('card_builder_hover_align_horizontal'),
          value: TextAlignEnum.CENTER,
        },
        {
          icon: <IconCozTextAlignRight className="text-[16px]" />,
          label: I18n.t('card_builder_hover_align_right'),
          value: TextAlignEnum.RIGHT,
        },
      ].map(d => ({
        ...d,
        label: (
          <div className="flex flex-row items-center gap-[4px]">
            {d.icon}
            {d.label}
          </div>
        ),
      }))}
      renderSelectedItem={
        ((option: { icon: React.ReactNode }) => {
          const { icon } = option;
          return <div className="flex flex-row items-center">{icon}</div>;
        }) as RenderSelectedItemFn
      }
    />
  );
};
