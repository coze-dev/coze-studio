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

import { type FC } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Slider } from '@coze-arch/coze-design';

import styles from './border-width.module.less';

interface IProps {
  value: number;
  onChange: (value: number) => void;
  options?: [number, number, number];
  min?: number;
  max?: number;
}
export const BorderWidth: FC<IProps> = props => {
  const { value, onChange, min, max } = props;

  return (
    <div
      className={classnames(
        'flex gap-[12px] text-[14px]',
        styles['imageflow-canvas-border-width'],
      )}
    >
      <div className="w-full flex items-center gap-[8px]">
        <div className="min-w-[42px]">
          {I18n.t('imageflow_canvas_stroke_width')}
        </div>
        <div className="flex-1 min-w-[320px]">
          <Slider
            min={min}
            max={max}
            step={1}
            showArrow={false}
            value={value}
            onChange={o => {
              onChange(o as number);
            }}
          />
        </div>
      </div>
    </div>
  );
};
