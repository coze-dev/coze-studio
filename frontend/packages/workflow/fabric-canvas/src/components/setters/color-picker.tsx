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

import { useCallback, type FC, useMemo } from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozCheckMarkFill } from '@coze-arch/coze-design/icons';
import { Input, Slider } from '@coze-arch/coze-design';

import styles from './color-picker.module.less';
interface IProps {
  // #ffffffff
  value: string | number;
  onChange: (value: string | number) => void;
  showOpacity?: boolean;
  showColor?: boolean;
  readonly?: boolean;
}

const colors = [
  '#000000',
  '#ffffff',
  '#C6C6CD',
  '#FF441E',
  '#3EC254',
  '#4D53E8',
  '#00B2B2',
  '#FF9600',
];

const ColorRect = (props: {
  color: string;
  size?: number;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}) => {
  const { color, size = 24, onClick, selected, className } = props;
  return (
    <div
      onClick={onClick}
      className={`${className} rounded-[4px]`}
      style={{ backgroundColor: color, width: size, height: size }}
    >
      <div
        className={classnames([
          'relative top-0 left-0',
          'flex items-center justify-center',
          'rounded-[4px] border border-solid border-stroke',
        ])}
        style={{
          width: size,
          height: size,
          color: color !== '#ffffff' ? '#fff' : '#000',
        }}
      >
        {selected ? <IconCozCheckMarkFill /> : undefined}
      </div>
    </div>
  );
};

const isHexOpacityColor = (value: string): boolean =>
  /^#[0-9A-Fa-f]{8}$/.test(value);
const isHexColor = (value: string): boolean => /^#[0-9A-Fa-f]{6}$/.test(value);
const opacity16To255ScaleTo100 = (v: string): number => parseInt(v, 16) / 2.55;
const opacity100ScaleTo255To16 = (v: number): string =>
  Math.floor(v * 2.55)
    .toString(16)
    .padStart(2, '0');

export const ColorPicker: FC<IProps> = props => {
  const {
    value = '#ffffffff',
    onChange,
    showOpacity = true,
    showColor = true,
    readonly = false,
  } = props;

  const { color, opacity } = useMemo(() => {
    if (!showColor) {
      return {
        opacity: (value as number) * 100,
      };
    }
    return {
      color: (value as string).substring(0, 7),
      opacity: opacity16To255ScaleTo100((value as string).substring(7, 9)),
    };
  }, [value, showColor]);

  const _onChange = useCallback(
    (v: string) => {
      if (isHexOpacityColor(v)) {
        onChange(v);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col w-full gap-[12px] text-[14px]">
      {showColor ? (
        <div className="flex items-center w-full gap-[16px]">
          <div className="flex items-center flex-1 gap-[12px]">
            {colors.map(c => {
              const selected =
                c.toUpperCase() === (color as string).toUpperCase();
              return (
                <ColorRect
                  key={`rect-${c}`}
                  className={`${readonly ? '' : 'cursor-pointer'}`}
                  selected={selected}
                  onClick={() => {
                    if (readonly) {
                      return;
                    }
                    _onChange(`${c}${opacity100ScaleTo255To16(opacity)}`);
                  }}
                  color={c}
                />
              );
            })}
          </div>
          <Input
            // Because it is in uncontrolled mode, when clicking on the color block, you need to reset the input.value. So here color is the key
            key={`input-${color}`}
            disabled={readonly}
            prefix={<ColorRect color={color as string} size={16} />}
            type="text"
            className="w-[110px]"
            // Why not use controlled mode? With controlled mode, format checking triggered during user input is cumbersome to handle
            defaultValue={color}
            onChange={v => {
              if (isHexColor(v)) {
                _onChange(`${v}${opacity100ScaleTo255To16(opacity)}`);
              }
            }}
          />
        </div>
      ) : undefined}
      {showOpacity ? (
        <div className="w-full flex items-center gap-[8px]">
          <div className="min-w-[80px]">
            {I18n.t('imageflow_canvas_transparency')}
          </div>
          <div
            className={classnames(
              'flex-1 min-w-[320px]',
              styles['color-picker-slider'],
            )}
          >
            <Slider
              min={0}
              showArrow={false}
              max={100}
              step={1}
              value={opacity}
              disabled={readonly}
              onChange={o => {
                if (!showColor) {
                  onChange((o as number) / 100);
                } else {
                  _onChange(`${color}${opacity100ScaleTo255To16(o as number)}`);
                }
              }}
            />
          </div>
        </div>
      ) : undefined}
    </div>
  );
};
