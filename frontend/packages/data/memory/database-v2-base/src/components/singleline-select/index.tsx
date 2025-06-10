import classnames from 'classnames';
import { Select, type SelectProps, type InputProps } from '@coze/coze-design';

import s from './index.module.less';

export interface SLSelectRefType {
  triggerFocus?: () => void;
}

export type SLSelectProps = InputProps & {
  value: SelectProps['value'];
  handleChange?: (v: SelectProps['value']) => void;
  errorMsg?: string;
  errorMsgFloat?: boolean;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- 历史逻辑
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
