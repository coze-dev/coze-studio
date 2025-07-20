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
   * 获取 IOC 容器
   */
  container: interfaces.Container;
  /**
   * 获取 IOC 容器的 单例模块
   * @param identifier
   */
  get: <T>(identifier: interfaces.ServiceIdentifier<T>) => T;

  /**
   * 获取 IOC 容器的 多例模块
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
   * IDE 注册阶段
   */
  onInit?: (ctx: CTX, opts: OPTS) => void;
  /**
   * IDE loading 阶段, 一般用于加载全局配置，如 i18n 数据
   */
  onLoading?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * IDE 布局初始化阶段，在 onLoading 之后执行
   */
  onLayoutInit?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * IDE 开始执行, 可以加载业务逻辑
   */
  onStart?: (ctx: CTX, opts: OPTS) => MaybePromise<void>;
  /**
   * 在浏览器 `beforeunload` 之前执行，如果返回true，则会阻止
   */
  onWillDispose?: (ctx: CTX, opts: OPTS) => boolean | void;
  /**
   * IDE 销毁
   */
  onDispose?: (ctx: CTX, opts: OPTS) => void;
}

export interface PluginConfig<OPTS, CTX extends PluginContext = PluginContext>
  extends PluginLifeCycle<CTX, OPTS> {
  /**
   * 插件 IOC 注册, 等价于 containerModule
   * @param ctx
   */
  onBind?: (bindConfig: PluginBindConfig, opts: OPTS) => void;
  /**
   * IOC 模块，用于更底层的插件扩展
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
          // 去重
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
        // 防止 plugin 被上层业务多次 init
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
 *    // IOC 注册
 *    onBind(bind) {
 *      bind('xxx').toSelf().inSingletonScope()
 *    },
 *    // IDE 初始化
 *    onInit() {
 *    },
 *    // IDE 销毁
 *    onDispose() {
 *    },
 *    // IOC 模块
 *    containerModules: [new ContainerModule(() => {})]
 * })
 */
export const createLifecyclePlugin = <
  CTX extends PluginContext = PluginContext,
>(
  options: PluginConfig<undefined, CTX>,
) => definePluginCreator<undefined, CTX>(options)(undefined);
