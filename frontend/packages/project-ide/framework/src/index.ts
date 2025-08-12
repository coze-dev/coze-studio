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

/** pass-through sdk */
export {
  IDEClient,
  ReactWidget,
  LayoutPanelType,
  URI,
  definePluginCreator,
  bindContributions,
  ViewContribution,
  LifecycleContribution,
  Emitter,
  Event,
  Disposable,
  DisposableCollection,
  useIDEService,
  useNavigation,
  LabelHandler,
  CommandContribution,
  ShortcutsContribution,
  OpenerService,
  useCurrentWidget,
  DISABLE_HANDLE_EVENT,
  ViewService,
  LayoutRestorer,
  ApplicationShell,
  WidgetManager,
  ViewRenderer,
  type PluginCreator,
  type ViewOptionRegisterService,
  type BoxPanel,
  ShortcutsService,
  CommandRegistry,
  useIDEContainer,
  TabBarToolbar,
  ContextKeyService,
  type ShortcutsRegistry,
  SplitWidget,
  Command,
  WindowService,
  type CustomTitleType,
} from '@coze-project-ide/client';

export { useCommitVersion } from '@coze-project-ide/base-adapter';

export {
  useCurrentWidgetContext,
  useSpaceId,
  useProjectId,
  useProjectIDEServices,
  useActivateWidgetContext,
  useIDENavigate,
  useCurrentModeType,
  useSplitScreenArea,
  useTitle,
  useIDELocation,
  useIDEParams,
  useIDEServiceInBiz,
  useShortcuts,
  useListenMessageEvent,
  useWsListener,
  useSendMessageEvent,
  useViewService,
  useGetUIWidgetFromId,
} from './hooks';
export { IDEGlobalProvider, WidgetContext } from './context';
export {
  UI_BUILDER_URI,
  MAIN_PANEL_DEFAULT_URI,
  SIDEBAR_URI,
  URI_SCHEME,
  SIDEBAR_CONFIG_URI,
  CONVERSATION_URI,
  SECONDARY_SIDEBAR_URI,
  CustomCommand,
} from './constants';
export type { TitlePropsType, WidgetRegistry } from './types';

export {
  withLazyLoad,
  getResourceByPathname,
  getURIByResource,
  getResourceByURI,
  getURIPathByPathname,
  getURLByURI,
  getURIByPath,
  getPathnameByURI,
  compareURI,
  addPreservedSearchParams,
} from './utils';
export { ProjectIDEServices } from './plugins/create-preset-plugin/project-ide-services';
export { WidgetService } from './plugins/create-preset-plugin/widget-service';

export {
  ProjectIDEClient,
  ResourceFolder,
  mapResourceTree,
  ResourceTypeEnum,
  BaseResourceContextMenuBtnType,
  type CommonRenderProps,
  type ResourceType,
  type ResourceMapType,
  type ResourceFolderRefType,
  type RightPanelConfigType,
  type ResourceFolderShortCutContextType,
  type ResourceFolderProps,
  type RenderMoreSuffixType,
  type CreateResourcePropType,
  RESOURCE_FOLDER_CONTEXT_KEY,
  ROOT_KEY,
  type IdType,
} from './components';

export { useIDEGlobalStore, useIDEGlobalContext } from './context';

export { ProjectIDEWidget } from './widgets/project-ide-widget';

export { CloseConfirmContribution } from './plugins/close-confirm-plugin/close-confirm-contribution';

export {
  ModalService,
  ModalType,
  OptionsService,
  ErrorService,
  type MessageEvent,
} from './services';
