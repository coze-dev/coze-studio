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
   * 创建文件夹
   */
  createFolder: () => void;
  /**
   * 创建资源
   */
  createResource: (type: string) => void;
  /**
   * 重命名资源
   */
  renameResource: (id: IdType) => void;
  /**
   * 手动关闭右键菜单
   */
  closeContextMenu: () => void;
  /**
   * 收起所有文件夹
   */
  collapseAll: () => void;
  /**
   * 展开所有文件夹
   */
  expandAll: () => void;
  /**
   * 手动聚焦
   */
  focus: () => void;
  /**
   * 手动失焦
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
   * 主要的资源类型，非必填。
   * 主要用于快捷键创建资源的默认类型。
   */
  defaultResourceType?: string;
  /**
   * 是否使用乐观 ui;
   * false 时，onChange 失效;
   * default = true
   *
   * 传入 loadingRender 时，会对乐观保存的 item 尾部增加一个渲染块，由外部控制渲染
   */
  useOptimismUI?:
    | boolean
    | {
        loadingRender?: () => React.ReactElement;
      };

  /**
   * 当前选中的资源 id， 受控的
   */
  selected?: string;

  /**
   * 是否渲染每个 item 末尾的 more 按钮，hover 等同于 右键
   */
  renderMoreSuffix?: RenderMoreSuffixType;

  /**
   * 用于 name 校验的配置
   */
  validateConfig?: ValidatorConfigType;

  /**
   * 支持搜索, 高亮展示
   */
  searchConfig?: {
    searchKey?: string;
    highlightStyle?: React.CSSProperties;
  };

  /**
   * 可选。
   * 传入则是受控的收起展开树。
   * 不传则内部自己维护树
   */
  collapsedMap?: Record<string, boolean>;
  setCollapsedMap?: (v: Record<string, boolean>) => void;

  /**
   * 树变更的回调函数，依赖 useOptimismUI 为 true。
   */
  onChange?: (resource: ResourceType[]) => void;

  /**
   * 单击选中资源的回调，仅支持非 folder 类型资源
   */
  onSelected?: (id: string | number, resource: ResourceType) => void;
  /**
   * 拖拽完成之后的回调
   */
  onDrag?: (v: DragPropType) => void;
  /**
   * 修改 name 之后的回调
   */
  onChangeName?: (v: ChangeNameType) => void;
  /**
   * 创建资源的回调
   */
  onCreate?: (v: CreateResourcePropType) => void;
  /**
   * 删除的回调。该方法不会被乐观 ui 逻辑改写，最好业务层加一个二次确认逻辑，删除之后走数据更新的方式来更新树组件
   */
  onDelete?: (ids: ResourceType[]) => void;

  /**
   * 用于自定义配置渲染资源的 icon
   * @returns react 节点
   */
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;

  /**
   * 用于自定义配置每一项末尾的元素
   */
  suffixRender?: {
    width: number; // 用于文本超长的 tooltip 偏移量计算的，是一个必填字段
    render: (v: CommonRenderProps) => React.ReactElement | undefined;
  };

  /**
   * 用于自定义配置每一个资源的文本渲染器。
   * 如果采用自定义渲染，则需要自己实现搜索高亮能力
   * @returns react 节点
   */
  textRender?: (v: CommonRenderProps) => React.ReactElement | undefined;

  /**
   * 右键菜单配置
   * @param v 当前临时选中的资源列表。 可以通过 id 判断是否是根文件。（ROOT_KEY: 根文件 id）
   * @returns 组件内置注册好的命令和菜单，详见 BaseResourceContextMenuBtnType 枚举
   */
  contextMenuHandler?: (v: ResourceType[]) => RightPanelConfigType[];

  /**
   * 右键菜单弹窗展示和隐藏的回调。
   */
  onContextMenuVisibleChange?: (v: boolean) => void;

  /**
   * 禁用右键菜单，主要是兼容在 popover 的场景内
   */
  contextMenuDisabled?: boolean;

  /**
   * 一些用于杂七杂八的配置项
   */
  config?: ConfigType;

  /**
   * 能力黑名单
   */
  powerBlackMap?: {
    dragAndDrop?: boolean;
    folder?: boolean;
  };

  /**
   * 列表为空的渲染组件
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
     * 临时选中的表
     */
    const [tempSelectedMapRef, setTempSelectedMap] = useStateRef<
      Record<string, ResourceType>
    >({}, v => {
      updateContext?.({ tempSelectedMap: v });
    });

    /**
     * 打平的树
     */
    const resourceMap = useRef<ResourceMapType>(_resourceMap || {});
    const changeResourceMap = nextMap => {
      resourceMap.current = nextMap;
      // 变更之后维护临时选中表
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
     * 处理一系列收起展开的 hook
     */
    const { collapsedMapRef, handleCollapse, setCollapsed, collapsedState } =
      useCollapsedMap({
        _collapsedMap,
        _setCollapsedMap,
        resourceMap,
      });

    /**
     * 用于渲染的树
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
     * 用于收敛树组件的滚动，聚焦逻辑的 hook
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
     * 处理选中的资源变更之后的副作用
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
       * 为空数组，或者数组中只有一个 root 节点
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
                !powerBlackMap?.folder && // 不支持文件夹则不需支持拖拽时候的高亮
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
                 * 拖拽过程中的样式
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
                 * 拖拽过程中的 hover 态优先级 大于 临时选中态的优先级
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
            {/* 添加 24px 底部间距，标识加载完全 */}
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
