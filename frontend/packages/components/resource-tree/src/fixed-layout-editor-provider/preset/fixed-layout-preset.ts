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

import {
  createOperationPlugin,
  type PluginsProvider,
  createDefaultPreset,
  createPlaygroundPlugin,
  type Plugin,
  FlowDocumentOptionsDefault,
  FlowDocumentOptions,
  FlowNodesContentLayer,
  FlowNodesTransformLayer,
  FlowScrollBarLayer,
  FlowScrollLimitLayer,
  createPlaygroundReactPreset,
} from '@flowgram-adapter/fixed-layout-editor';

import {
  type FixedLayoutPluginContext,
  type FixedLayoutProps,
  DEFAULT,
} from './fixed-layout-props';
import { FixedLayoutContainerModule } from './container-module';

export function createFixedLayoutPreset(
  opts: FixedLayoutProps,
): PluginsProvider<FixedLayoutPluginContext> {
  return (ctx: FixedLayoutPluginContext) => {
    opts = { ...DEFAULT, ...opts };
    let plugins: Plugin[] = [createOperationPlugin(opts)];
    /**
     * Load default editor configuration
     */
    plugins = createDefaultPreset(opts, plugins)(ctx);
    /*
     * Load fixed layout canvas module
     * */
    plugins.push(
      createPlaygroundPlugin<FixedLayoutPluginContext>({
        containerModules: [FixedLayoutContainerModule],
        onBind(bindConfig) {
          if (!bindConfig.isBound(FlowDocumentOptions)) {
            bindConfig.bind(FlowDocumentOptions).toConstantValue({
              ...FlowDocumentOptionsDefault,
              jsonAsV2: true,
              defaultLayout: opts.defaultLayout,
              toNodeJSON: opts.toNodeJSON,
              fromNodeJSON: opts.fromNodeJSON,
              allNodesDefaultExpanded: opts.allNodesDefaultExpanded,
            } as FlowDocumentOptions);
          }
        },
        onInit: _ctx => {
          _ctx.playground.registerLayers(
            FlowNodesContentLayer, // Node content rendering
            FlowNodesTransformLayer, // Node position offset calculation
          );
          if (!opts.scroll?.disableScrollLimit) {
            // Control scroll range
            _ctx.playground.registerLayer(FlowScrollLimitLayer);
          }
          if (!opts.scroll?.disableScrollBar) {
            // control bar
            _ctx.playground.registerLayer(FlowScrollBarLayer);
          }
          if (opts.nodeRegistries) {
            _ctx.document.registerFlowNodes(...opts.nodeRegistries);
          }
        },
      }),
    );
    return createPlaygroundReactPreset(opts, plugins)(ctx);
  };
}
