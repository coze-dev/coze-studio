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

import { type FC, useCallback, useMemo } from 'react';

import { clamp } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { IconCozFontHeight } from '@coze-arch/coze-design/icons';
import { Select, Tooltip, type SelectProps } from '@coze-arch/coze-design';

interface IProps extends Omit<SelectProps, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

export const LineHeight: FC<IProps> = props => {
  const { onChange, min, max, value, optionList, ...rest } = props;
  const _onChange = useCallback(
    (v: string) => {
      const _v = Number(`${v}`.replace('%', ''));
      if (isFinite(_v)) {
        onChange?.(Number((clamp(_v, min, max) / 100).toFixed(2)));
      }
    },
    [onChange, min, max],
  );

  const _optionsList = useMemo(() => {
    const _options = [...(optionList ?? [])];
    if (
      !_options
        .map(o => o.value)
        .includes(
          Number((Number(`${value}`.replace('%', '')) * 100).toFixed(0)),
        )
    ) {
      _options.unshift({
        label: `${Number((value * 100).toFixed(0))}%`,
        value: Number((value * 100).toFixed(0)),
      });
    }
    return _options;
  }, [optionList, value]);

  return (
    <div className="flex gap-[8px] items-center">
      {/* <IconCozFontHeight className="text-[16px] m-[8px]" /> */}
      <Tooltip
        content={I18n.t('imageflow_canvas_text_tooltip2')}
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
      >
        <Select
          prefix={
            <IconCozFontHeight className="text-[16px] coz-fg-secondary m-[8px]" />
          }
          {...rest}
          /**
           * Since allowCreate is enabled, the optionList will no longer respond to dynamic changes
           * Give a key here, re-render select, and ensure that the optionList meets expectations
           */
          key={_optionsList.map(d => d.label).join()}
          filter
          value={Number((value * 100).toFixed(0))}
          allowCreate
          onChange={v => {
            _onChange(v as string);
          }}
          optionList={_optionsList}
          style={{ width: '104px' }}
        />
      </Tooltip>
    </div>
  );
};
