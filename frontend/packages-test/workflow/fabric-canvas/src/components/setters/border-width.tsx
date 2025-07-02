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
