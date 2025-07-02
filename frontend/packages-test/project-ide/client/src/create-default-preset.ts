import { bindContributions } from '@flowgram-adapter/common';
import { createHistoryPlugin } from '@flowgram-adapter/common';
import {
  createViewPlugin,
  createContextMenuPlugin,
} from '@coze-project-ide/view';
import {
  OpenHandler,
  createEventPlugin,
  createPreferencesPlugin,
  CommandContribution,
  createCommandPlugin,
  createResourcePlugin,
  createStylesPlugin,
  type PluginsProvider,
  type Plugin,
  createShortcutsPlugin,
  createLifecyclePlugin,
  LifecycleContribution,
  createNavigationPlugin,
  createLabelPlugin,
} from '@coze-project-ide/core';

import { type IDEClientOptions, type IDEClientContext } from './types';
import { ClientDefaultContribution } from './contributions/client-default-contribution';

export function createDefaultPreset<CTX extends IDEClientContext>(
  optionsProvider: (ctx: CTX) => IDEClientOptions,
): PluginsProvider<CTX> {
  return (ctx: CTX) => {
    const opts = optionsProvider(ctx);
    const plugins: Plugin[] = [];
    /**
     * 注册内置插件
     */
    plugins.push(
      createResourcePlugin(opts.resource || {}), // 资源系统
      createViewPlugin(
        opts.view || {
          widgetFactories: [],
          defaultLayoutData: {
            activityBarItems: [],
            defaultWidgets: [],
          },
        },
      ), // 布局系统
      // Breaking change：bw 额外从业务侧引入
      createNavigationPlugin(opts.navigation || {}),
      createCommandPlugin(opts.command || {}), // 指令注册
      createHistoryPlugin(opts.history || {}), // 历史注册
      createLifecyclePlugin(opts), // IDE 生命周期注册
      createLabelPlugin(opts.label || {}), // 标签注册
      createShortcutsPlugin(opts.shortcut || {}), // 快捷键
      createPreferencesPlugin(opts.preferences || {}), // 偏好设置
      createStylesPlugin({}),
      createContextMenuPlugin(), // 右键菜单注册
      createEventPlugin(), // 全局事件注册
    );
    /**
     * client 扩展
     */
    plugins.push(
      createLifecyclePlugin({
        onBind({ bind }) {
          bindContributions(bind, ClientDefaultContribution, [
            CommandContribution,
            LifecycleContribution,
          ]);
          if (opts.openHandlers) {
            opts.openHandlers.forEach(handler => {
              if (typeof handler === 'function') {
                bind(handler).toSelf().inSingletonScope();
                bind(OpenHandler).toService(handler);
              } else {
                bind(OpenHandler).toConstantValue(handler);
              }
            });
          }
        },
      }),
    );
    /**
     * 注册业务扩展的插件
     */
    if (opts.plugins) {
      plugins.push(...opts.plugins);
    }
    return plugins;
  };
}
