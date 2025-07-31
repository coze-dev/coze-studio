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

/** public function */

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
