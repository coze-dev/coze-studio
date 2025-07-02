import { type FC } from 'react';

import { getInputComponent } from './utils';
import { type LiteralValueInputProps } from './type';
import { DEFAULT_COMPONENT_REGISTRY } from './constants';

export const LiteralValueInput: FC<LiteralValueInputProps> = props => {
  const {
    inputType,
    componentRegistry = DEFAULT_COMPONENT_REGISTRY,
    config,
  } = props;
  const InputComponent = getInputComponent(
    inputType,
    config?.optionsList,
    componentRegistry,
  );
  return <InputComponent key={inputType} {...props} />;
};
