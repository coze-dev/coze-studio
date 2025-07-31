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

import { type FC, type RefObject } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozAlignBottom,
  IconCozAlignCenterHorizontal,
  IconCozAlignCenterVertical,
  IconCozAlignLeft,
  IconCozAlignRight,
  IconCozAlignTop,
  IconCozDistributeHorizontal,
  IconCozDistributeVertical,
} from '@coze-arch/coze-design/icons';
import { Select } from '@coze-arch/coze-design';

import { AlignMode } from '../../typings';
import styles from '../../index.module.less';

interface IProps {
  readonly?: boolean;
  popRefAlignRight: RefObject<HTMLDivElement> | null;
  onChange: (v: AlignMode) => void;
}

export const Align: FC<IProps> = props => {
  const { readonly, onChange, popRefAlignRight } = props;

  const renderItem = ({
    name,
    value,
    icon,
    suffix,
  }: {
    name: string;
    value: AlignMode;
    icon: JSX.Element;
    suffix: string;
  }) => (
    <Select.Option value={value}>
      <div className="w-[172px] px-[8px] flex gap-[4px] align-center coz-fg-primary">
        <div className="text-[16px] flex items-center">{icon}</div>
        <div className="flex-1 text-[14px]">{name}</div>
        <div className="coz-fg-secondary text-[12px]">{suffix}</div>
      </div>
    </Select.Option>
  );
  return (
    // Prohibit bubbling to prevent the selected state of canvas from being cleared when clicking align
    <div
      onClick={e => {
        e.stopPropagation();
      }}
    >
      <Select
        disabled={readonly}
        className={'hide-selected-label hide-border'}
        dropdownClassName={styles['select-hidden-group-label']}
        showTick={false}
        size="small"
        getPopupContainer={() => popRefAlignRight?.current ?? document.body}
        onSelect={v => {
          onChange(v as AlignMode);
        }}
        maxHeight={300}
        restTagsPopoverProps={{
          trigger: 'hover',
        }}
      >
        <Select.OptGroup label="a">
          {[
            {
              name: I18n.t('imageflow_canvas_align1', {}, '左对齐'),
              value: AlignMode.Left,
              icon: <IconCozAlignLeft />,
              suffix: '⌥ + A',
            },
            {
              name: I18n.t('imageflow_canvas_align2', {}, '水平居中'),
              value: AlignMode.Center,
              icon: <IconCozAlignCenterVertical />,
              suffix: '⌥ + H',
            },
            {
              name: I18n.t('imageflow_canvas_align3', {}, '右对齐'),
              value: AlignMode.Right,
              icon: <IconCozAlignRight />,
              suffix: '⌥ + D',
            },
          ].map(renderItem)}
        </Select.OptGroup>
        <Select.OptGroup label="b">
          {[
            {
              name: I18n.t('imageflow_canvas_align4', {}, '顶部对齐'),
              value: AlignMode.Top,
              icon: <IconCozAlignTop />,
              suffix: '⌥ + W',
            },
            {
              name: I18n.t('imageflow_canvas_align5', {}, '垂直居中'),
              value: AlignMode.Middle,
              icon: <IconCozAlignCenterHorizontal />,
              suffix: '⌥ + V',
            },
            {
              name: I18n.t('imageflow_canvas_align6', {}, '底部对齐'),
              value: AlignMode.Bottom,
              icon: <IconCozAlignBottom />,
              suffix: '⌥ + S',
            },
          ].map(renderItem)}
        </Select.OptGroup>

        <Select.OptGroup label="c">
          {[
            {
              name: I18n.t('imageflow_canvas_align7', {}, '水平均分'),
              value: AlignMode.VerticalAverage,
              icon: <IconCozDistributeHorizontal />,
              suffix: '^ + ⌥ + H',
            },
            {
              name: I18n.t('imageflow_canvas_align8', {}, '垂直均分'),
              value: AlignMode.HorizontalAverage,
              icon: <IconCozDistributeVertical />,
              suffix: '^ + ⌥ + V',
            },
          ].map(renderItem)}
        </Select.OptGroup>
      </Select>
    </div>
  );
};
