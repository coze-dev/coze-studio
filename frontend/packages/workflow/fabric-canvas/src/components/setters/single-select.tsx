import { forwardRef } from 'react';

import {
  SingleSelect as CozeSingleSelect,
  type SingleSelectProps,
} from '@coze/coze-design';

export const SingleSelect = forwardRef<SingleSelectProps, SingleSelectProps>(
  props => {
    // (props, ref) => {
    const { onChange, ...rest } = props;
    return (
      <CozeSingleSelect
        {...rest}
        // ref={ref}
        onChange={v => {
          onChange?.(v.target.value);
        }}
      />
    );
  },
);
