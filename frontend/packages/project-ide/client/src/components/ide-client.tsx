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

import React, {
  useMemo,
  forwardRef,
  type ForwardRefRenderFunction,
} from 'react';

import { type interfaces } from 'inversify';
import {
  IDEProvider,
  IDERenderer,
  type IDEProviderProps,
  type IDEProviderRef,
} from '@coze-project-ide/core';

import { type IDEClientOptions, IDEClientContext } from '../types';
import { createDefaultPreset } from '../create-default-preset';

export interface IDEClientProps {
  options: (ctx: IDEClientContext) => IDEClientOptions;
  container?: interfaces.Container;
  containerModules?: interfaces.ContainerModule[]; // Injected IOC packet
  children?: React.ReactNode;
  className?: string;
}

const IDEClientWithRef: ForwardRefRenderFunction<
  IDEProviderRef,
  IDEClientProps
> = ({ options, container, containerModules, children, className }, ref) => {
  const props = useMemo<IDEProviderProps>(
    () => ({
      containerModules,
      container,
      plugins: createDefaultPreset<IDEClientContext>(options),
      customPluginContext: c => IDEClientContext.create(c),
    }),
    [],
  );
  return (
    <IDEProvider {...props} ref={ref}>
      <>
        <IDERenderer className={className} />
        {children}
      </>
    </IDEProvider>
  );
};

export const IDEClient = forwardRef(IDEClientWithRef);
