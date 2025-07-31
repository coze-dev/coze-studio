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

// TODO first encapsulates a business component for joint debugging, and then abstracts it into a general request select.
import React, { Suspense, lazy } from 'react';

import { InputNumber, Tooltip } from '@coze-arch/coze-design';
import { Slider } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';

import styles from '../index.module.less';
const LazyMdbox = lazy(async () => {
  const { MdBoxLazy } = await import('@coze-arch/bot-md-box-adapter/lazy');
  return {
    default: MdBoxLazy,
  };
});
export const Divider = () => (
  <div className="border-0 border-t border-solid coz-stroke-primary" />
);

export const SettingLayout = (props: {
  title: string;
  description?: string;
  bolder?: boolean;
  center?: React.ReactNode;
  right?: React.ReactNode;
  leftClassName?: string;
}) => {
  const {
    title,
    description,
    center,
    right,
    bolder,
    leftClassName = '',
  } = props;
  return (
    <div className="flex gap-[4px]">
      <div
        className={`${center ? 'w-[162px]' : 'flex-1'} ${
          bolder ? 'font-semibold' : 'font-normal'
        } flex items-center ${leftClassName}`}
      >
        {title}
        {description ? (
          <Tooltip
            content={
              <Suspense fallback={null}>
                <LazyMdbox
                  markDown={description}
                  autoFixSyntax={{ autoFixEnding: false }}
                />
              </Suspense>
            }
          >
            <IconInfo className="pl-[8px] cursor-pointer coz-fg-dim" />
          </Tooltip>
        ) : undefined}
      </div>
      {center ? <div className="flex-1">{center}</div> : undefined}
      {right ? <div className="w-[110px]">{right}</div> : undefined}
    </div>
  );
};

export const SettingSlider = (props: {
  title: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  precision?: number;
  defaultValue?: number;
  onChange: (v: string | number) => void;
  readonly?: boolean;
}) => {
  const {
    title,
    description,
    onChange,
    min = 0,
    max = 100,
    value = 0,
    precision = 0,
    readonly,
  } = props;

  const _step = 1 / Math.pow(10, precision);
  return (
    <SettingLayout
      title={title}
      description={description}
      center={
        <div className={`relative ${styles.slider}`}>
          <Slider
            key={title}
            disabled={readonly}
            value={value}
            min={min}
            max={max}
            step={_step}
            marks={{
              [min]: `${min}`,
              [max]: `${max}`,
            }}
            onChange={v => {
              onChange(v as number);
            }}
          />
        </div>
      }
      right={
        <InputNumber
          disabled={readonly}
          precision={precision}
          value={value}
          min={min}
          max={max}
          step={_step}
          onChange={v => {
            if (v !== value) {
              onChange(v as number);
            }
          }}
        />
      }
    />
  );
};
