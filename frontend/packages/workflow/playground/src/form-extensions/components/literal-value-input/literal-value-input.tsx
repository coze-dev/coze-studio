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
