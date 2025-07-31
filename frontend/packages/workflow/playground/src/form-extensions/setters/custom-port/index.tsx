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

import { type CSSProperties } from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import type {
  SetterComponentProps,
  SetterExtension,
} from '@flowgram-adapter/free-layout-editor';

import { CustomPort } from '../../../components/custom-port';

type CustomPortProps = SetterComponentProps<{
  portId: string;
  portType: 'input' | 'output';
  className?: string;
  style: CSSProperties;
  collapsedClassName?: string;
  collapsedStyle?: CSSProperties;
}>;

export const CustomPortSetter = ({ options }: CustomPortProps) => {
  const {
    portID,
    portType,
    className,
    style,
    collapsedClassName,
    collapsedStyle,
  } = options;

  const { getNodeSetterId, concatTestId } = useNodeTestId();
  const setterTestId = getNodeSetterId('custom-port');
  const testId = concatTestId(setterTestId, portID);

  return (
    <CustomPort
      portId={portID}
      portType={portType}
      className={className}
      style={style}
      collapsedClassName={collapsedClassName}
      collapsedStyle={collapsedStyle}
      testId={testId}
    />
  );
};

export const customPort: SetterExtension = {
  key: 'CustomPort',
  component: CustomPortSetter,
};
