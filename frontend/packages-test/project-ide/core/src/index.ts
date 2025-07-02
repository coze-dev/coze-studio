/** 公共函数 */

export {
  Emitter,
  logger,
  useRefresh,
  Disposable,
  DisposableCollection,
  bindContributions,
  Event,
} from '@flowgram-adapter/common';

export {
  createLifecyclePlugin,
  definePluginCreator,
  loadPlugins,
  Plugin,
  PluginContext,
  ContextKeyService,
  type PluginCreator,
  type PluginsProvider,
  type PluginConfig,
  type PluginBindConfig,
  type OpenerOptions,
  LifecycleContribution,
  OpenerService,
  OpenHandler,
  ContainerFactory,
  StorageService,
  WindowService,
  URI,
  URIHandler,
  prioritizeAllSync,
  prioritizeAll,
} from './common';

/** application */
export { Application, IDEContainerModule } from './application';

/** resource */
export {
  type ResourcePluginOptions,
  createResourcePlugin,
  type Resource,
  type ResourceInfo,
  ResourceError,
  ResourceHandler,
  ResourceService,
  AutoSaveResource,
  AutoSaveResourceOptions,
} from './resource';

/** command */
export {
  Command,
  createCommandPlugin,
  CommandService,
  CommandContainerModule,
  CommandContribution,
  CommandRegistry,
  type CommandHandler,
  type CommandPluginOptions,
  CommandRegistryFactory,
} from './command';

/** shortcut */
export {
  createShortcutsPlugin,
  ShortcutsContainerModule,
  type ShortcutsPluginOptions,
  ShortcutsContribution,
  ShortcutsService,
  type ShortcutsRegistry,
  Shortcuts,
  SHORTCUTS,
  domEditable,
} from './shortcut';

/** preference */
export {
  createPreferencesPlugin,
  PreferenceContribution,
  type PreferenceSchema,
  type PreferencesPluginOptions,
} from './preference';

/** navigation */
export {
  createNavigationPlugin,
  type NavigationPluginOptions,
  NavigationService,
  NavigationHistory,
} from './navigation';

/** styles\colors\themes */
export {
  createStylesPlugin,
  StylingContribution,
  type Collector,
  type ColorTheme,
  ThemeService,
} from './styles';

/** label */
export {
  type LabelChangeEvent,
  LabelHandler,
  type LabelPluginOptions,
  LabelService,
  createLabelPlugin,
  URILabel,
} from './label';

/** react renderer */
export {
  useIDEService,
  useIDEContainer,
  useNavigation,
  useLocation,
  useStyling,
  IDEProvider,
  IDEContainerContext,
  type IDEProviderProps,
  type IDEProviderRef,
  IDERenderer,
  IDERendererProvider,
} from './renderer';

/** event */
export { createEventPlugin, EventService, EventContribution } from './event';
