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
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */

import ReactDOM from 'react-dom';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { noop } from 'lodash-es';

import { createUniqId, flatTree, mapResourceTree } from './utils';
import {
  type DragPropType,
  type ResourceType,
  type ChangeNameType,
  type ResourceMapType,
  type CreateResourcePropType,
  type CommonRenderProps,
  type RightPanelConfigType,
  ResourceTypeEnum,
  type ValidatorConfigType,
  type ConfigType,
  type RenderMoreSuffixType,
  type IdType,
} from './type';
import { BaseRender } from './render-components/base-render';
import { useStateRef } from './hooks/uss-state-ref';
import { useSelectedChange } from './hooks/use-selected-change';
import { useRightClickPanel } from './hooks/use-right-click-panel';
import { useRegisterCommand } from './hooks/use-register-command';
import { useOptimismUI } from './hooks/use-optimism-ui';
import {
  DATASET_PARENT_DATA_STOP_TAG,
  DATASET_RESOURCE_FOLDER_KEY,
} from './hooks/use-mouse-event/utils';
import { useMouseEvent } from './hooks/use-mouse-event';
import { useFocusResource } from './hooks/use-focus-resource';
import { useEvent } from './hooks/use-custom-event';
import {
  CREATE_RESOURCE_ID,
  useCreateEditResource,
} from './hooks/use-create-edit-resource';
import { useContextChange } from './hooks/use-context-change';
import { useCollapsedMap } from './hooks/use-collapsed-map';
import { RESOURCE_FOLDER_WRAPPER_CLASS, ROOT_KEY, ROOT_NODE } from './constant';

import s from './index.module.less';

interface RefType {
  /**
   * Create Folder
   */
  createFolder: () => void;
  /**
   * Create a resource
   */
  createResource: (type: string) => void;
  /**
   * rename resource
   */
  renameResource: (id: IdType) => void;
  /**
   * Close the right-click menu manually
   */
  closeContextMenu: () => void;
  /**
   * Close all folders
   */
  collapseAll: () => void;
  /**
   * Expand all folders
   */
  expandAll: () => void;
  /**
   * manual focus
   */
  focus: () => void;
  /**
   * Manual out of focus
   */
  blur: () => void;
}

interface Props {
  id?: string;
  style?: React.CSSProperties;
  resourceTree: ResourceType | ResourceType[];
  resourceMap: ResourceMapType;
  disabled?: boolean;

  /**
   * Main resource type, optional.
   * Mainly used to shortcut the default type for creating resources.
   */
  defaultResourceType?: string;
  /**
   * Whether to use optimistic UI;
   * When false, onChange is invalid;
   * default = true
   *
   * When passing in loadingRender, a render block will be added to the tail of the optimistically saved item, which will be rendered by external control
   */
  useOptimismUI?:
    | boolean
    | {
        loadingRender?: () => React.ReactElement;
      };

  /**
   * The currently selected resource id, controlled
   */
  selected?: string;

  /**
   * Whether to render the more button at the end of each item, hover is equivalent to right click
   */
  renderMoreSuffix?: RenderMoreSuffixType;

  /**
   * Configuration for name validation
   */
  validateConfig?: ValidatorConfigType;

  /**
   * Support search, highlight
   */
  searchConfig?: {
    searchKey?: string;
    highlightStyle?: React.CSSProperties;
  };

  /**
   * Optional.
   * The incoming is a controlled retract expansion tree.
   * If you don't pass it on, you will maintain the tree internally.
   */
  collapsedMap?: Record<string, boolean>;
  setCollapsedMap?: (v: Record<string, boolean>) => void;

  /**
   * Callback function for tree changes, depending on useOptimismUI to be true.
   */
  onChange?: (resource: ResourceType[]) => void;

  /**
   * Click the callback for the selected resource, only non-folder type resources are supported
   */
  onSelected?: (id: string | number, resource: ResourceType) => void;
  /**
   * Callback after dragging is complete
   */
  onDrag?: (v: DragPropType) => void;
  /**
   * Callback after modifying name
   */
  onChangeName?: (v: ChangeNameType) => void;
  /**
   * Create a callback for a resource
   */
  onCreate?: (v: CreateResourcePropType) => void;
  /**
   * Deleted callback. This method will not be overwritten by optimistic ui logic. It is best to add a secondary confirmation logic to the business layer. After deletion, take the data update method to update the tree component.
   */
  onDelete?: (ids: ResourceType[]) => void;

  /**
   * Icons for customizing configuration rendering resources
   * @returns react node
   */
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;

  /**
   * Use to customize the elements at the end of each item
   */
  suffixRender?: {
    width: number; // Used for the calculation of the tooltip offset for very long text, is a required field
    render: (v: CommonRenderProps) => React.ReactElement | undefined;
  };

  /**
   * Text renderer for custom configuration of each resource.
   * If you use custom rendering, you need to implement the search highlighting capability yourself
   * @returns react node
   */
  textRender?: (v: CommonRenderProps) => React.ReactElement | undefined;

  /**
   * right-click menu configuration
   * @Param v List of currently temporarily selected resources. You can determine whether it is a root file by id. (ROOT_KEY: root file id)
   * @Returns component built-in registered commands and menus, see BaseResourceContextMenuBtnType enumeration
   */
  contextMenuHandler?: (v: ResourceType[]) => RightPanelConfigType[];

  /**
   * Right-click menu pop-ups to show and hide callbacks.
   */
  onContextMenuVisibleChange?: (v: boolean) => void;

  /**
   * Disable the right-click menu, mainly compatible in the popover scene
   */
  contextMenuDisabled?: boolean;

  /**
   * Some configuration items for miscellaneous purposes
   */
  config?: ConfigType;

  /**
   * ability blacklist
   */
  powerBlackMap?: {
    dragAndDrop?: boolean;
    folder?: boolean;
  };

  /**
   * Rendering component with empty list
   */
  empty?: React.ReactElement;
}

let idIndex = 0;

const ResourceFolder = forwardRef<RefType, Props>(
  (
    {
      id,
      resourceTree: _resourceTree,
      resourceMap: _resourceMap,
      selected,
      disabled,
      searchConfig,
      defaultResourceType,
      useOptimismUI: _useOptimismUI = false,
      style,
      collapsedMap: _collapsedMap,
      setCollapsedMap: _setCollapsedMap,
      validateConfig,
      onChange = noop,
      onSelected: _onSelected = noop,
      onDrag: _onDrag = noop,
      onChangeName: _onChangeName = noop,
      onCreate: _onCreate = noop,
      onDelete: _onDelete = noop,
      iconRender,
      suffixRender,
      textRender,
      renderMoreSuffix: _renderMoreSuffix = false,
      contextMenuHandler,
      onContextMenuVisibleChange,
      contextMenuDisabled,
      config,
      powerBlackMap,
      empty,
    },
    ref,
  ) => {
    const uniqId = useRef(id ? id : `${idIndex++}`);

    const resourceTreeWrapperRef = useRef<HTMLDivElement>(null);

    const { updateContext, clearContext, updateId } = useContextChange(
      uniqId.current,
    );

    const renderMoreSuffix = contextMenuDisabled ? false : _renderMoreSuffix;

    /**
     * Temporarily selected table
     */
    const [tempSelectedMapRef, setTempSelectedMap] = useStateRef<
      Record<string, ResourceType>
    >({}, v => {
      updateContext?.({ tempSelectedMap: v });
    });

    /**
     * Flattened Tree
     */
    const resourceMap = useRef<ResourceMapType>(_resourceMap || {});
    const changeResourceMap = nextMap => {
      resourceMap.current = nextMap;
      // Maintain the temporary selection table after the change
      tempSelectedMapRef.current = Object.keys(
        tempSelectedMapRef.current,
      ).reduce((pre, cur) => {
        if (resourceMap.current[cur]) {
          return {
            ...pre,
            [cur]: resourceMap.current[cur],
          };
        }
        return pre;
      }, {});
      setTempSelectedMap(tempSelectedMapRef.current);
    };
    useEffect(() => {
      changeResourceMap(_resourceMap);
    }, [_resourceMap]);

    /**
     * Handle a series of retracted and unfolded hooks
     */
    const { collapsedMapRef, handleCollapse, setCollapsed, collapsedState } =
      useCollapsedMap({
        _collapsedMap,
        _setCollapsedMap,
        resourceMap,
      });

    /**
     * Tree for rendering
     */
    const [resourceTreeRef, setResourceTree] = useStateRef<ResourceType>(
      {
        ...ROOT_NODE,
        children:
          _resourceTree instanceof Array ? _resourceTree : [_resourceTree],
      } as unknown as ResourceType,
      v => {
        setResourceList(
          flatTree(v, resourceMap.current, collapsedMapRef.current),
        );
      },
    );

    const changeResourceTree = v => {
      resourceTreeRef.current = v;
      changeResourceMap(mapResourceTree(v?.children || []));
      setResourceTree(resourceTreeRef.current);
    };

    const [resourceList, setResourceList] = useStateRef(
      flatTree(
        resourceTreeRef.current,
        resourceMap.current,
        collapsedMapRef.current,
      ),
    );

    useEffect(() => {
      setResourceList(
        flatTree(
          resourceTreeRef.current,
          resourceMap.current,
          collapsedMapRef.current,
        ),
      );
    }, [collapsedState]);

    const disabledRef = useRef(!!disabled);
    useEffect(() => {
      disabledRef.current = !!disabled;
    }, [disabled]);

    /**
     * Hooks for scrolling, focusing logic of convergent tree components
     */
    const { scrollInView, scrollWrapper, tempDisableScroll } = useFocusResource(
      {
        resourceTreeRef,
        collapsedMapRef,
        resourceMap,
        config,
      },
    );

    const {
      handleDrag: onDrag,
      handleChangeName: onChangeName,
      handleCreate: onCreate,
      handleDelete: onDelete,
      optimismSavingMap,
      clearOptimismSavingMap,
    } = useOptimismUI({
      enable: !!_useOptimismUI,
      onDrag: _onDrag,
      onChangeName: _onChangeName,
      onCreate: _onCreate,
      onDelete: _onDelete,
      changeResourceTree,
      scrollInView,
      resourceTreeRef,
      resourceMap,
      onChange,
    });

    useEffect(() => {
      resourceTreeRef.current = {
        ...ROOT_NODE,
        children:
          _resourceTree instanceof Array ? _resourceTree : [_resourceTree],
      };
      setResourceTree(resourceTreeRef.current);
      clearOptimismSavingMap();
    }, [_resourceTree]);

    /**
     * Handling side effects after changes to selected resources
     */
    const selectedIdRef = useSelectedChange({
      selected,
      resourceMap,
      collapsedMapRef,
      setCollapsed,
      tempSelectedMapRef,
      setTempSelectedMap,
      scrollInView,
      updateContext,
    });

    const { addEventListener, onMouseDownInDiv, onMouseUpInDiv } = useEvent();

    const {
      onMouseMove,
      context: dragAndDropContext,
      context: { isFocus },
      isFocusRef,
      dragPreview,
      handleFocus,
      handleBlur,
    } = useMouseEvent({
      draggable: !powerBlackMap?.dragAndDrop,
      uniqId: uniqId.current,
      updateId,
      iconRender,
      resourceTreeWrapperRef,
      collapsedMapRef,
      tempSelectedMapRef,
      setTempSelectedMap,
      setCollapsedMap: handleCollapse,
      resourceTreeRef,
      selectedIdRef,
      onSelected: (...props) => {
        _onSelected(...props);
        tempDisableScroll();
      },
      onDrag,
      addEventListener,
      disabled: disabledRef,
      resourceMap,
      config,
    });

    const { registerEvent, registerCommand } = useRegisterCommand({
      isFocus,
      updateContext,
      clearContext,
      id: uniqId.current,
      selectedIdRef,
      tempSelectedMapRef,
    });

    const {
      context: createEditResourceContext,
      onCreateResource,
      isInEditModeRef,
      handleRenderList,
      handleRename,
    } = useCreateEditResource({
      folderEnable: !powerBlackMap?.folder,
      defaultResourceType,
      registerEvent,
      setCollapsedMap: handleCollapse,
      resourceTreeRef,
      tempSelectedMapRef,
      selectedIdRef,
      isFocusRef,
      resourceMap,
      onChangeName,
      onCreate,
      disabled: disabledRef,
      onDelete,
      validateConfig,
      config,
      resourceList,
    });

    const { contextMenuCallback, closeContextMenu } = useRightClickPanel({
      tempSelectedMapRef,
      contextMenuHandler,
      registerCommand,
      id: uniqId.current,
      contextMenuDisabled,
      onContextMenuVisibleChange,
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        handleFocus();
      },
      blur: () => {
        handleBlur();
      },
      createResource: (type: string) => {
        if (isInEditModeRef.current || !type) {
          return;
        }
        onCreateResource?.(type);
      },
      renameResource: (resourceId: IdType) => {
        handleRename(resourceId);
      },
      createFolder: () => {
        if (isInEditModeRef.current) {
          return;
        }
        onCreateResource?.(ResourceTypeEnum.Folder);
      },
      expandAll: () => {
        collapsedMapRef.current = {};
        setCollapsed(collapsedMapRef.current);
      },
      collapseAll: () => {
        collapsedMapRef.current = Object.keys(resourceMap.current).reduce(
          (pre, cur) => {
            if (
              cur !== ROOT_KEY &&
              resourceMap.current?.[cur]?.type === 'folder'
            ) {
              return {
                ...pre,
                [cur]: true,
              };
            }
            return pre;
          },
          {},
        );
        setCollapsed(collapsedMapRef.current);
      },
      closeContextMenu,
    }));

    const commonProps = {
      searchConfig,
      suffixRender,
      config,
      renderMoreSuffix,
      textRender,
      contextMenuCallback,
      resourceTreeWrapperRef,
      iconRender,
      isDragging: dragAndDropContext.isDragging,
      draggingError: dragAndDropContext.draggingError,
      currentHoverItem: dragAndDropContext.currentHoverItem,
      validateConfig,
      errorMsg: createEditResourceContext.errorMsg,
      errorMsgRef: createEditResourceContext.errorMsgRef,
      editResourceId: createEditResourceContext.editResourceId,
      handleChangeName: createEditResourceContext.handleChangeName,
      handleSave: createEditResourceContext.handleSave,
      useOptimismUI: _useOptimismUI,
    };

    const createNode = createEditResourceContext?.createResourceInfo ? (
      <div key={CREATE_RESOURCE_ID}>
        <BaseRender
          resource={{
            id: CREATE_RESOURCE_ID,
            name: '',
            type: createEditResourceContext?.createResourceInfo.type,
          }}
          path={[
            ...(resourceMap.current?.[
              createEditResourceContext?.createResourceInfo.parentId
            ]?.path || []),
            CREATE_RESOURCE_ID,
          ]}
          isInEdit={
            CREATE_RESOURCE_ID === createEditResourceContext.editResourceId
          }
          {...commonProps}
        />
      </div>
    ) : null;

    const renderResourceList = handleRenderList(
      resourceList.current,
      createEditResourceContext?.createResourceInfo,
    );

    const emptyRender = () => {
      const list = renderResourceList || [];

      /**
       * Is an empty array, or there is only one root node in the array
       */
      if (
        (list.length === 0 ||
          (list.length === 1 &&
            list[0] !== CREATE_RESOURCE_ID &&
            list[0].id === ROOT_KEY)) &&
        empty
      ) {
        return empty;
      }

      return null;
    };

    return (
      <>
        <div
          key={uniqId.current}
          className={`resource-list-wrapper ${s['resource-list-wrapper']}`}
          ref={resourceTreeWrapperRef}
          style={style || {}}
        >
          <div
            {...{
              [`data-${DATASET_PARENT_DATA_STOP_TAG}`]: true,
              [`data-${DATASET_RESOURCE_FOLDER_KEY}`]: uniqId.current,
            }}
            ref={scrollWrapper}
            className={`${createUniqId(
              RESOURCE_FOLDER_WRAPPER_CLASS,
              uniqId.current,
            )} resource-list-drag-and-drop-wrapper resource-list-custom-event-wrapper resource-list-scroll-container`}
            onMouseDown={onMouseDownInDiv}
            onMouseUp={onMouseUpInDiv}
            onMouseMove={onMouseMove}
            onContextMenu={e => {
              e.preventDefault();
            }}
            onContextMenuCapture={contextMenuCallback}
          >
            {renderResourceList.map((resource, i) => {
              if (resource === CREATE_RESOURCE_ID) {
                return createNode;
              }

              if (resource.id === ROOT_KEY) {
                return null;
              }

              if (!resource) {
                return <></>;
              }
              const isInEdit =
                String(resource.id) ===
                String(createEditResourceContext.editResourceId);
              const isSelected = String(selected) === String(resource.id);
              const isTempSelected = !!tempSelectedMapRef.current[resource.id];
              const preItemTempSelected =
                resourceList.current[i - 1]?.id !== ROOT_KEY &&
                !!tempSelectedMapRef.current[resourceList.current[i - 1]?.id];
              const nextItemTempSelected =
                !!tempSelectedMapRef.current[resourceList.current[i + 1]?.id];

              const isExpand = !collapsedMapRef.current[resource.id];
              const highlightItem =
                !powerBlackMap?.folder && // If folders are not supported, there is no need to support highlighting when dragging.
                !!dragAndDropContext.highlightItemMap[resource.id];
              const preHighlightItem =
                resourceList.current[i - 1]?.id !== ROOT_KEY &&
                !!dragAndDropContext.highlightItemMap[
                  resourceList.current[i - 1]?.id
                ];
              const nextHighlightItem =
                !!dragAndDropContext.highlightItemMap[
                  resourceList.current[i + 1]?.id
                ];

              const extraClassName = [
                /**
                 * Styles during drag and drop
                 */
                ...(highlightItem
                  ? [
                      resource.id !== ROOT_KEY ? 'dragging-hover-class' : '',
                      !preHighlightItem && !nextHighlightItem
                        ? 'base-radius-class-single'
                        : '',
                      !preHighlightItem ? 'base-radius-class-first' : '',
                      !nextHighlightItem ? 'base-radius-class-last' : '',
                    ]
                  : []),
                isSelected ? 'item-is-selected' : '',
                /**
                 * The priority of the hover state during the dragging process is greater than the priority of the temporarily selected state
                 */
                ...(isTempSelected && !highlightItem
                  ? [
                      'item-is-temp-selected',
                      !preItemTempSelected && !nextItemTempSelected
                        ? 'base-radius-class-single'
                        : '',
                      !preItemTempSelected ? 'base-radius-class-first' : '',
                      !nextItemTempSelected ? 'base-radius-class-last' : '',
                    ]
                  : []),
                isInEdit ? 'item-is-in-edit' : '',
                dragAndDropContext.isDragging || isSelected
                  ? ''
                  : 'base-item-hover-class',
              ].join(' ');

              return (
                <div
                  key={resource.id}
                  className={`item-wrapper ${extraClassName}`}
                  {...dragAndDropContext.dataHandler(resource)}
                >
                  <BaseRender
                    resource={resource}
                    path={resource.path || []}
                    isSelected={isSelected}
                    isTempSelected={isTempSelected}
                    isInEdit={isInEdit}
                    isExpand={isExpand}
                    isOptimismSaving={
                      _useOptimismUI && optimismSavingMap[resource.id]
                    }
                    {...commonProps}
                  />
                </div>
              );
            })}
            {emptyRender()}
            {/* Add 24px bottom spacing to identify fully loaded */}
            <div style={{ padding: 12 }}></div>
          </div>
        </div>
        {ReactDOM.createPortal(dragPreview, document.body)}
      </>
    );
  },
);

export {
  ResourceFolder,
  ROOT_KEY,
  type Props as ResourceFolderProps,
  type RefType as ResourceFolderRefType,
  mapResourceTree,
};

export {
  type ResourceType,
  type ResourceMapType,
  type CommonRenderProps,
  type RightPanelConfigType,
  type RenderMoreSuffixType,
  ResourceTypeEnum,
  type ResourceFolderContextType as ResourceFolderShortCutContextType,
  type CreateResourcePropType,
  type IdType,
} from './type';

export {
  BaseResourceContextMenuBtnType,
  RESOURCE_FOLDER_CONTEXT_KEY,
} from './constant';
