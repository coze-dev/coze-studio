// TODO 为了联调先封装一个业务组件，后面再抽象成通用的request select
import React, { Suspense, lazy } from 'react';

import { InputNumber, Tooltip } from '@coze/coze-design';
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
