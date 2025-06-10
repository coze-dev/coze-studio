import React, { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozTextAlignCenter,
  IconCozTextAlignLeft,
  IconCozTextAlignRight,
} from '@coze/coze-design/icons';
import { Select, type RenderSelectedItemFn } from '@coze/coze-design';

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
