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

export {
  Input as UIInput,
  /**
   * @deprecated Please use UIInput instead
   */
  Input,
} from './components/ui-input';
export {
  Button as UIButton,
  /**
   * @deprecated Please use UIButton instead
   */
  Button,
  type UIButtonProps,
} from './components/ui-button';
export {
  UIFormInput,
  UIFormTextArea,
  UIFormSelect,
} from './components/ui-form';
export { UITable } from './components/ui-table';
export type { UITableProps, UITableMethods } from './components/ui-table';
export { UITableAction } from './components/ui-table-action';
export type {
  ActionItemProps as UIActionItemProps,
  UITableActionProps,
} from './components/ui-table-action';
export { UITableMeta } from './components/ui-table-meta';
export type { UITableMetaProps } from './components/ui-table-meta';
export { UISelect } from './components/ui-select';
export { UIPagination } from './components/ui-pagination';
export type { UIPaginationProps } from './components/ui-pagination';
export { UILayout } from './components/ui-layout';
export { UITabBar } from './components/ui-tab-bar';
export type { UITabBarProps } from './components/ui-tab-bar';
export { UIIconButton } from './components/ui-icon-button';
export type { UIIconButtonProps } from './components/ui-icon-button';
// export * from './components/ui-search'; // TODO: ui-search contains logic code, move it out of bot-semi
export {
  UIModal,
  UICompositionModal,
  UICompositionModalMain,
  UICompositionModalSider,
  UIDragModal,
  UITabsModal,
  /**
   * @deprecated Please use `useUIModal` instead
   */
  useModal,
  useModal as useUIModal,
} from './components/ui-modal';
export type {
  UIModalType,
  SemiModalProps,
  UIModalProps,
  UICompositionModalProps,
  UseModalParams,
} from './components/ui-modal';
export { SignFrame, SignPanel } from './components/ui-sign';
export { UIEmpty, type UIEmptyProps } from './components/ui-empty';
// export * from './components/ui-breadcrumb'; // TODO: ui-breadcrumb contains logic code, move it out of bot-semi
export { UITag } from './components/ui-tag';
export type { UITagProps, TagColor } from './components/ui-tag';
export { UICascader } from './components/ui-cascader';
export { UIToast } from './components/ui-toast';
export {
  DropdownTitle,
  /**
   * @deprecated Please use `UIDropdownMenu` instead
   */
  Menu,
  Menu as UIDropdownMenu,
  /**
   * @deprecated Please use `UIDropdownItem` instead
   */
  Item,
  Item as UIDropdownItem,
  UIDropdown,
} from './components/ui-dropdown';
export { UIFlipMove } from './components/ui-flip-move';
export { UIAudio, IconCycle, UIAudioIconColor } from './components/ui-audio';
export { UIDrawer } from './components/ui-drawer';
export { UISearchInput } from './components/ui-search-input';
export type { UISearchInputProps } from './components/ui-search-input';
export { UISearch } from './components/ui-search';
export type { UISearchProps } from './components/ui-search';
export { UIDivider } from './components/ui-divider';
export { useGrab } from './hooks/use-grab';

// eslint-disable-next-line @coze-arch/no-batch-import-or-export
export * from './semi';
