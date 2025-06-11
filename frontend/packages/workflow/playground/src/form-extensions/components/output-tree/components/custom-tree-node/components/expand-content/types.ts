import { type FC } from 'react';

import { type TreeNodeCustomData, type DefaultValueType } from '../../type';

export interface DefaultValueInputProps {
  className?: string;
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (value: DefaultValueType | null) => void;
  onBlur?: (value?: DefaultValueType | null) => void;
  defaultValue?: DefaultValueType;
  inputType?: string;
  onInputTypeChange?: (type: string) => void;
}

export type DefaultValueInputComponent = FC<DefaultValueInputProps>;
