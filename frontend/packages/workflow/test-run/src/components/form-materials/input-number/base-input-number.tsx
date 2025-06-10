import { useCallback } from 'react';

import { CozInputNumber, type InputNumberProps } from '@coze/coze-design';

export type BaseInputNumberAdapterProps = {
  value?: number | string;
  onChange?: (v?: number | string) => void;
} & Pick<InputNumberProps, 'precision'>;

export const BaseInputNumberAdapter: React.FC<BaseInputNumberAdapterProps> = ({
  onChange,
  ...props
}) => {
  const handleChange = useCallback(
    (v: number | string) => {
      onChange?.(v === '' ? undefined : v);
    },
    [onChange],
  );
  return (
    <CozInputNumber
      onChange={handleChange}
      {...props}
      size="small"
      style={{ width: '100%' }}
    />
  );
};
