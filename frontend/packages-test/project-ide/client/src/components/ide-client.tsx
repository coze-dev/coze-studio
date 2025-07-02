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
  containerModules?: interfaces.ContainerModule[]; // 注入的 IOC 包
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
