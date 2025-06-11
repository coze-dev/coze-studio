import classnames from 'classnames';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { type InputProps } from '@coze-arch/bot-semi/Input';
import { Select } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface SLSelectRefType {
  triggerFocus?: () => void;
}

export type SLSelectProps = InputProps & {
  value: SelectProps['value'];
  handleChange?: (v: SelectProps['value']) => void;
  errorMsg?: string;
  errorMsgFloat?: boolean;
  selectProps?: SelectProps & { 'data-dtestid'?: string };
};

export const SLSelect: React.FC<SLSelectProps> = props => {
  const { errorMsg, errorMsgFloat } = props;
  return (
    <div
      className={classnames({
        [s['select-wrapper']]: true,
        [s['error-wrapper']]: Boolean(errorMsg),
      })}
    >
      <Select
        {...props.selectProps}
        style={{ width: '100%' }}
        value={props.value}
        onChange={v => {
          props?.handleChange?.(v);
        }}
        dropdownClassName={s['selected-option']}
      />
      {errorMsg ? (
        <div
          className={classnames({
            [s['error-content']]: true,
            [s['error-float']]: Boolean(errorMsgFloat),
          })}
        >
          <div className={s['error-text']}>{errorMsg}</div>
        </div>
      ) : null}
    </div>
  );
};
