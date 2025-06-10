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
     * 加载默认编辑器配置
     */
    plugins = createDefaultPreset(opts, plugins)(ctx);
    /*
     * 加载固定布局画布模块
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
            FlowNodesContentLayer, // 节点内容渲染
            FlowNodesTransformLayer, // 节点位置偏移计算
          );
          if (!opts.scroll?.disableScrollLimit) {
            // 控制滚动范围
            _ctx.playground.registerLayer(FlowScrollLimitLayer);
          }
          if (!opts.scroll?.disableScrollBar) {
            // 控制条
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
