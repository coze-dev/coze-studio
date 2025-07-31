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

/* eslint-disable complexity */
import React, { useCallback, useMemo } from 'react';

import classNames from 'classnames';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze-arch/coze-design/icons';
import { Loading, Tooltip } from '@coze-arch/coze-design';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type ProjectResourceAction,
  ProjectResourceActionKey,
  type ProjectResourceGroupType,
} from '@coze-arch/bot-api/plugin_develop';
import {
  type CommonRenderProps,
  getURIByResource,
  type RenderMoreSuffixType,
  type ResourceFolderProps,
  ResourceTypeEnum,
  type RightPanelConfigType,
  ROOT_KEY,
} from '@coze-project-ide/framework';

import { usePrimarySidebarStore } from '@/stores';

import {
  getContextMenuLabel,
  getResourceIconByResource,
  isDynamicAction,
  isResourceActionEnabled,
  validateNameBasic,
  validateNameConflict,
} from '../utils';
import {
  type BizGroupTypeWithFolder,
  BizResourceContextMenuBtnType,
  type BizResourceType,
  BizResourceTypeEnum,
  type ResourceFolderCozeProps,
  type ResourceSubType,
} from '../type';
import { Empty } from '../empty';
import {
  contextMenuDTOToVOMap,
  createResourceLabelMap,
  DISABLE_FOLDER,
  ITEM_HEIGHT,
  MAX_DEEP,
  TAB_SIZE,
  VARIABLE_RESOURCE_ID,
} from '../constants';

export type UseResourceFolderConfigProps = {
  groupType: ProjectResourceGroupType;
  iconRender?: ResourceFolderProps['iconRender'];
  onAction?: (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => void;
  onCreateSubTypeResource?: (
    resourceType: BizGroupTypeWithFolder,
    subType?: ResourceSubType,
  ) => void;
  createResourceConfig?: ResourceFolderCozeProps['createResourceConfig'];
  /**
   * Hide more menu button
   */
  hideMoreBtn?: boolean;
} & Pick<ResourceFolderProps, 'validateConfig'>;
// eslint-disable-next-line @coze-arch/max-line-per-function
export const useResourceFolderConfig = ({
  groupType,
  iconRender,
  onAction,
  onCreateSubTypeResource,
  createResourceConfig,
  validateConfig,
  hideMoreBtn,
}: UseResourceFolderConfigProps): Partial<ResourceFolderProps> => {
  const textRender = useCallback(
    ({ resource, isSelected }: CommonRenderProps) => (
      <span
        className={classNames('text-[14px]', isSelected ? 'font-medium' : '')}
      >
        {resource.name}
      </span>
    ),
    [],
  );

  const [FLAGS] = useFlags();

  const contextMenuHandler = useCallback(
    (selectedResources: BizResourceType[]): RightPanelConfigType[] => {
      if (!selectedResources.length || hideMoreBtn) {
        return [];
      }
      if (selectedResources.length === 1) {
        const resource = selectedResources[0];
        if (resource.id === VARIABLE_RESOURCE_ID) {
          return [];
        }
        if (resource.id === ROOT_KEY) {
          // New folder, new file, import resource library
          const createHandlers = createResourceConfig
            ? createResourceConfig.map(({ label, subType }) => ({
                id: `${BizResourceContextMenuBtnType.CreateResource}-${subType}`,
                execute: () => onCreateSubTypeResource?.(groupType, subType),
                label,
              }))
            : [
                {
                  id: BizResourceContextMenuBtnType.CreateResource,
                  label: createResourceLabelMap[groupType],
                },
              ];
          return [
            DISABLE_FOLDER
              ? null
              : {
                  id: BizResourceContextMenuBtnType.CreateFolder,
                  label: createResourceLabelMap[ResourceTypeEnum.Folder],
                },
            ...createHandlers,
            {
              id: BizResourceContextMenuBtnType.ImportLibraryResource,
              label: getContextMenuLabel(
                BizResourceContextMenuBtnType.ImportLibraryResource,
              ),
              execute: () =>
                onAction?.(BizResourceContextMenuBtnType.ImportLibraryResource),
            },
          ].filter(Boolean) as RightPanelConfigType[];
        }

        const mapFunc = ({
          key,
          enable,
          hint,
        }: ProjectResourceAction): RightPanelConfigType | null => {
          const menuType = contextMenuDTOToVOMap[key];
          if (!menuType) {
            return null;
          }
          return {
            id: menuType,
            disabled: !enable,
            tooltip: I18n.t((hint || '') as I18nKeysNoOptionsType, {}, hint),
            label: getContextMenuLabel(menuType, resource),
            execute: isDynamicAction(menuType)
              ? () => onAction?.(menuType, resource)
              : undefined,
          };
        };
        const noDeleteActions = resource.actions?.filter(
          action => action.key !== ProjectResourceActionKey.Delete,
        );

        const deleteAction = resource.actions?.filter(
          action => action.key === ProjectResourceActionKey.Delete,
        );
        const noDeleteHandlers =
          noDeleteActions
            ?.map<RightPanelConfigType | null>(mapFunc)
            ?.filter((c): c is RightPanelConfigType => Boolean(c)) || [];
        const deleteHandler =
          deleteAction
            ?.map<RightPanelConfigType | null>(mapFunc)
            ?.filter((c): c is RightPanelConfigType => Boolean(c)) || [];

        if (!noDeleteHandlers?.length || !deleteHandler?.length) {
          return [...noDeleteHandlers, ...deleteHandler];
        }
        return [...noDeleteHandlers, { type: 'separator' }, ...deleteHandler];
      }
      if (
        selectedResources.every(resource =>
          isResourceActionEnabled(resource, ProjectResourceActionKey.Delete),
        )
      ) {
        return [
          {
            id: BizResourceContextMenuBtnType.Delete,
            label: getContextMenuLabel(BizResourceContextMenuBtnType.Delete),
          },
        ];
      }
      return [];
    },
    [
      createResourceConfig,
      groupType,
      onAction,
      onCreateSubTypeResource,
      FLAGS,
      hideMoreBtn,
    ],
  );

  const setCanClosePopover = usePrimarySidebarStore(
    state => state.setCanClosePopover,
  );

  return {
    textRender,
    iconRender: useCallback(
      (renderProps: CommonRenderProps): React.ReactElement | undefined => {
        const { resource, isExpand } = renderProps;
        const icon =
          iconRender?.(renderProps) ||
          getResourceIconByResource(resource, isExpand);
        return (
          <span className="inline-flex coz-fg-secondary text-[14px]">
            {icon}
          </span>
        );
      },
      [iconRender],
    ),
    useOptimismUI: {
      loadingRender: () => (
        <Loading className="relative mr-1 top-0.5" loading={true} size="mini" />
      ),
    },
    contextMenuHandler,
    validateConfig: useMemo(
      () => ({
        customValidator: params =>
          validateNameBasic(params) || validateNameConflict(params),
        errorMsgRender: msg => (
          <Tooltip theme={'dark'} position="right" content={msg}>
            <IconCozWarningCircleFill className="coz-fg-hglt-red absolute right-1 text-[13px]" />
          </Tooltip>
        ),
        ...validateConfig,
      }),
      [validateConfig],
    ),
    config: useMemo(
      () => ({
        itemHeight: ITEM_HEIGHT,
        maxDeep: MAX_DEEP,
        tabSize: TAB_SIZE,
        input: {
          placeholder: I18n.t('project_resource_sidebar_please_enter'),
          style: { borderRadius: 'var(--coze-4)' },
        },
        resourceUriHandler: resource =>
          resource.type
            ? getURIByResource(resource.type as string, resource.id)
            : null,
      }),
      [],
    ),
    renderMoreSuffix: useMemo<RenderMoreSuffixType>(
      () =>
        hideMoreBtn
          ? false
          : {
              style: { borderRadius: 'var(--coze-4)' },
              render: ({ baseBtn, resource }) => {
                if (
                  resource.type === BizResourceTypeEnum.Variable ||
                  ((resource as BizResourceType).actions || []).length === 0
                ) {
                  return <></>;
                }
                return baseBtn;
              },
            },
      [hideMoreBtn],
    ),
    empty: <Empty type={groupType} />,
    powerBlackMap: {
      dragAndDrop: false,
      folder: DISABLE_FOLDER,
    },
    onContextMenuVisibleChange: (visible: boolean) =>
      setCanClosePopover(!visible),
  };
};
