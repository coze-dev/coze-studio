import React, { type ReactNode } from 'react';

import classNames from 'classnames';
import { Slider } from '@coze-arch/coze-design';

import s from './index.module.less';

interface SliderAreaProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  marks?: { markKey: number; markText: string | ReactNode };
  disabled?: boolean;
  onChange: (value: number) => void;
  onClickDefault?: () => void;
  onMouseUp?: (e: unknown) => void;
  isDataSet?: boolean;
  customStyles?: {
    sliderAreaStyle: React.CSSProperties;
    boundaryStyle: React.CSSProperties;
  };
}

export const SliderArea: React.FC<SliderAreaProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  marks,
  onChange,
  onMouseUp,
  onClickDefault,
  disabled,
  customStyles,
  isDataSet = false,
}) => (
  <div
    className={classNames(s['slider-area'], {
      [s['slider-area-dataset']]: isDataSet,
    })}
  >
    <div className={s['slider-wrapper']}>
      <div className={s.slider} style={customStyles?.sliderAreaStyle}>
        <Slider
          step={step}
          min={min}
          max={max}
          value={value}
          marks={marks ? { [marks.markKey]: '' } : {}}
          disabled={disabled}
          onChange={v => onChange(v as number)}
          onMouseUp={e => {
            onMouseUp?.(e);
          }}
        />
      </div>
    </div>
    <div className={s['slider-boundary']} style={customStyles?.boundaryStyle}>
      <div className={s.min}>{min}</div>
      <div className={s.max}>{max}</div>
      {marks ? (
        <div
          className={s.marks}
          style={{
            left: `${((marks.markKey - min) / (max - min)) * 100}%`,
          }}
          onClick={() => {
            onClickDefault?.();
          }}
        >
          {marks.markText}
        </div>
      ) : (
        <></>
      )}
    </div>
  </div>
);
