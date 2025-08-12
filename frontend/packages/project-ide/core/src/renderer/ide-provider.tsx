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
  useEffect,
  forwardRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from 'react';

import { type interfaces, Container } from 'inversify';

import { loadPlugins, PluginContext, type PluginsProvider } from '../common';
import { Application, IDEContainerModule } from '../application';
import { IDEContainerContext } from './context';

export interface IDEProviderProps {
  containerModules?: interfaces.ContainerModule[]; // Injected IOC packet
  container?: interfaces.Container;
  customPluginContext?: (container: interfaces.Container) => PluginContext; // Customize the plugin's context
  plugins?: PluginsProvider<any>;
  children?: React.ReactElement<any, any> | null;
}

export interface IDEProviderRef {
  getContainer: () => interfaces.Container | undefined;
}

/**
 * IDE Container
 */
const IDEProviderWithRef: ForwardRefRenderFunction<
  IDEProviderRef,
  IDEProviderProps
> = (props, ref) => {
  const {
    containerModules,
    customPluginContext,
    container: fromContainer,
    plugins,
  } = props;

  /**
   * Create IOC package
   */
  const container = useMemo(() => {
    const mainContainer: interfaces.Container =
      fromContainer || new Container();
    mainContainer.load(IDEContainerModule);
    if (containerModules) {
      containerModules.forEach(module => mainContainer.load(module));
    }
    if (customPluginContext) {
      mainContainer
        .rebind(PluginContext)
        .toConstantValue(customPluginContext(mainContainer));
    }
    if (plugins) {
      loadPlugins(plugins(mainContainer.get(PluginContext)), mainContainer);
    }
    mainContainer.get(Application).init();
    return mainContainer;
    // @action Here props data will not trigger a refresh if changed, no modification is allowed
  }, []);

  useEffect(() => {
    const application = container.get(Application);
    application.start();
    return () => {
      application.dispose();
    };
  }, [container]);

  useImperativeHandle(ref, () => ({
    getContainer: () => container,
  }));

  return (
    <IDEContainerContext.Provider value={container}>
      {props.children}
    </IDEContainerContext.Provider>
  );
};

export const IDEProvider = forwardRef(IDEProviderWithRef);
