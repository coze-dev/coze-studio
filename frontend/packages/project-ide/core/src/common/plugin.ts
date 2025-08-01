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

import { ContainerModule, type interfaces } from 'inversify';
import type { MaybePromise } from '@flowgram-adapter/common';

import { LifecycleContribution } from './lifecycle-contribution';

export interface PluginContext {
  /**
   * Get IOC container
   */
  container: interfaces.Container;
  /**
   * Get the singleton module for the IOC container
   * @param identifier
   */
  get: <T>(identifier: interfaces.ServiceIdentifier<T>) => T;

  /**
   * Get the multi-instance module of the IOC container
   */
  getAll: <T>(identifier: interfaces.ServiceIdentifier<T>) => T[];
}

export const PluginContext = Symbol('PluginContext');

export interface PluginBindConfig {
  bind: interfaces.Bind;
  unbind: interfaces.Unbind;
  isBound: interfaces.IsBound;
  rebind: interfaces.Rebind;
}

interface PluginLifeCycle<CTX extends PluginContext, OPTS> {
  /**
   * IDE registration phase
   */
  onInit?: (ctx: CTX, opts: OPTS) => void;
  /**
   * IDE loading phase, generally used to load global configuration, such as i18n data
   */
  onLoading?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * IDE layout initialization phase, executed after onLoading
   */
  onLayoutInit?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * The IDE starts to execute and the business logic can be loaded
   */
  onStart?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * Execute before the browser'beforeunload ', if it returns true, it will be blocked
   */
  onWillDispose?: (ctx: CTX, opts: OPTS) => boolean | void;
  /**
   * IDE destruction
   */
  onDispose?: (ctx: CTX, opts: OPTS) => void;
}

export interface PluginConfig<OPTS, CTX extends PluginContext = PluginContext>
  extends PluginLifeCycle<CTX, OPTS> {
  /**
   * Plugin IOC registration, equivalent to containerModule
   * @param ctx
   */
  onBind?: (bindConfig: PluginBindConfig, opts: OPTS) => void;
  /**
   * IOC module for lower-level plug-in extensions
   */
  containerModules?: interfaces.ContainerModule[];
}

export const Plugin = Symbol('Plugin');

export interface Plugin<Options = any> {
  options: Options;
  pluginId: string;
  initPlugin: () => void;
  contributionKeys?: interfaces.ServiceIdentifier[];
  containerModules?: interfaces.ContainerModule[];
}

export interface PluginsProvider<CTX extends PluginContext = PluginContext> {
  (ctx: CTX): Plugin[];
}

export type PluginCreator<Options> = (opts: Options) => Plugin<Options>;

export function loadPlugins(
  plugins: Plugin[],
  container: interfaces.Container,
): void {
  const pluginInitSet = new Set<string>();
  const modules: interfaces.ContainerModule[] = plugins.reduce(
    (res, plugin) => {
      if (!pluginInitSet.has(plugin.pluginId)) {
        plugin.initPlugin();
        pluginInitSet.add(plugin.pluginId);
      }
      if (plugin.containerModules && plugin.containerModules.length > 0) {
        for (const module of plugin.containerModules) {
          // deduplicate
          if (!res.includes(module)) {
            res.push(module);
          }
        }
        return res;
      }
      return res;
    },
    [] as interfaces.ContainerModule[],
  );
  modules.forEach(module => container.load(module));
  plugins.forEach(plugin => {
    if (plugin.contributionKeys) {
      for (const contribution of plugin.contributionKeys) {
        container.bind(contribution).toConstantValue(plugin.options);
      }
    }
  });
}

function toLifecycleContainerModule<
  Options,
  CTX extends PluginContext = PluginContext,
>(
  config: PluginLifeCycle<CTX, Options>,
  opts: Options,
): interfaces.ContainerModule {
  return new ContainerModule(bind => {
    bind(LifecycleContribution).toDynamicValue(ctx => {
      const pluginContext = ctx.container.get<CTX>(PluginContext)!;
      return {
        onInit: () => config.onInit?.(pluginContext, opts),
        onLoading: () => config.onLoading?.(pluginContext, opts),
        onLayoutInit: () => config.onLayoutInit?.(pluginContext, opts),
        onStart: () => config.onStart?.(pluginContext, opts),
        onWillDispose: () => config.onWillDispose?.(pluginContext, opts),
        onDispose: () => config.onDispose?.(pluginContext, opts),
      };
    });
  });
}

let pluginIndex = 0;
export function definePluginCreator<
  Options,
  CTX extends PluginContext = PluginContext,
>(
  config: {
    containerModules?: interfaces.ContainerModule[];
    contributionKeys?: interfaces.ServiceIdentifier[];
  } & PluginConfig<Options, CTX>,
): PluginCreator<Options> {
  const { contributionKeys } = config;
  pluginIndex += 1;
  const pluginId = `IDE_${pluginIndex}`;
  return (opts: Options) => {
    const containerModules: interfaces.ContainerModule[] = [];
    let isInit = false;

    return {
      pluginId,
      initPlugin: () => {
        // Prevent the plugin from being inited multiple times by the upper business
        if (isInit) {
          return;
        }
        isInit = true;

        if (config.containerModules) {
          containerModules.push(...config.containerModules);
        }
        if (config.onBind) {
          containerModules.push(
            new ContainerModule((bind, unbind, isBound, rebind) => {
              config.onBind!(
                {
                  bind,
                  unbind,
                  isBound,
                  rebind,
                },
                opts,
              );
            }),
          );
        }
        if (
          config.onInit ||
          config.onLoading ||
          config.onLayoutInit ||
          config.onStart ||
          config.onWillDispose ||
          config.onDispose
        ) {
          containerModules.push(
            toLifecycleContainerModule<Options, CTX>(config, opts),
          );
        }
      },
      options: opts,
      contributionKeys,
      containerModules,
    };
  };
}

/**
 * @example
 * createLifecyclePlugin({
 *    //IOC Registrationgistration
 *    onBind(bind) {
 *      bind('xxx').toSelf().inSingletonScope()
 *    },
 *    //IDE initializationtialization
 *    onInit() {
 *    },
 *    //IDE destructionstruction
 *    onDispose() {
 *    },
 *    //IOC moduledule
 *    containerModules: [new ContainerModule(() => {})]
 * })
 */
export const createLifecyclePlugin = <
  CTX extends PluginContext = PluginContext,
>(
  options: PluginConfig<undefined, CTX>,
) => definePluginCreator<undefined, CTX>(options)(undefined);
