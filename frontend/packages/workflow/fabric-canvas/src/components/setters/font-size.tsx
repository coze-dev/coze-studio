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
import { IconCozFontSize } from '@coze-arch/coze-design/icons';
import { Select, type SelectProps, Tooltip } from '@coze-arch/coze-design';

interface IProps extends Omit<SelectProps, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

export const FontSize: FC<IProps> = props => {
  const { onChange, min, max, optionList, value, ...rest } = props;
  const _onChange = useCallback(
    (v: number) => {
      if (isFinite(v)) {
        onChange?.(clamp(v, min, max));
      }
    },
    [onChange, min, max],
  );

  const _optionsList = useMemo(() => {
    const _options = [...(optionList ?? [])];
    if (!_options.map(o => o.value).includes(value)) {
      _options.unshift({
        label: `${value}`,
        value,
      });
    }
    return _options;
  }, [optionList, value]);

  return (
    <div className="flex gap-[8px] items-center">
      {/* <IconCozFontSize className="text-[16px] m-[8px]" /> */}
      <Tooltip
        content={I18n.t('imageflow_canvas_text_tooltip1')}
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
      >
        <Select
          {...rest}
          prefix={
            <IconCozFontSize className="text-[16px] coz-fg-secondary m-[8px]" />
          }
          /**
           * Since allowCreate is enabled, the optionList will no longer respond to dynamic changes
           * Give a key here, re-render select, and ensure that the optionList meets expectations
           */
          key={_optionsList.map(d => d.label).join()}
          value={value}
          optionList={_optionsList}
          filter
          allowCreate
          onChange={v => {
            _onChange(v as number);
          }}
          style={{ width: '98px' }}
        />
      </Tooltip>
    </div>
  );
};
