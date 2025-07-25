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
 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function */
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { DragService, type URI, useIDEService } from '@coze-project-ide/client';

import { EventKey } from '../use-custom-event';
import { flatTree, getResourceListFromIdToId } from '../../utils';
import {
  type DragAndDropType,
  type ResourceType,
  type DragPropType,
  type ResourceMapType,
  type IdType,
  type CommonRenderProps,
  ResourceTypeEnum,
  type ConfigType,
} from '../../type';
import { MORE_TOOLS_CLASS_NAME, ROOT_KEY, ROOT_NODE } from '../../constant';
import {
  CLICK_OUTSIDE,
  CLICK_TOOL_BAR,
  type MousePosition,
  DATASET_PARENT_DATA_KEY_ID,
  findTargetElement,
  canStartDrag,
  getFolderIdFromPath,
  CLICK_CONTEXT_MENU,
  validateDrag,
  getElementByXY,
  DATASET_RESOURCE_FOLDER_KEY,
} from './utils';
import { useDragUI } from './use-drag-ui';

const useMouseEvent = ({
  draggable,
  uniqId,
  updateId,
  setTempSelectedMap,
  collapsedMapRef,
  setCollapsedMap,
  resourceTreeRef,
  onDrag,
  disabled,
  resourceMap,
  addEventListener,
  selectedIdRef,
  onSelected,
  tempSelectedMapRef,
  resourceTreeWrapperRef,
  iconRender,
  config,
}: {
  draggable: boolean; // 是否可以拖拽
  uniqId: string;
  updateId: () => void;
  resourceTreeWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
  setTempSelectedMap: (v: Record<string, ResourceType>) => void;
  collapsedMapRef: React.MutableRefObject<Record<string, boolean>>;
  setCollapsedMap: (id: IdType, v: boolean) => void;
  resourceTreeRef: React.MutableRefObject<ResourceType>;
  tempSelectedMapRef: React.MutableRefObject<Record<string, ResourceType>>;
  disabled?: React.MutableRefObject<boolean>;
  selectedIdRef?: React.MutableRefObject<string>;
  resourceMap: React.MutableRefObject<ResourceMapType>;
  onDrag: (v: DragPropType) => void;
  onSelected?: (id: string | number, resource: ResourceType) => void;
  addEventListener: (key: EventKey, fn: (e) => void) => void;
  iconRender?: (v: CommonRenderProps) => React.ReactElement | undefined;
  config?: ConfigType;
}): {
  context: DragAndDropType;
  isFocusRef: React.MutableRefObject<boolean>;
  dragPreview: React.ReactElement;
  onMouseMove;
  handleFocus: () => void;
  handleBlur: () => void;
} => {
  const isMouseDownRef = useRef<MousePosition | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const isFocusRef = useRef(false);
  const dragService = useIDEService<DragService>(DragService);
  /**
   * 存储拖拽过程中是否合法的字段
   */
  const [draggingError, setDraggingError] = useState<string>('');

  const multiModeFirstSelected = useRef<ResourceType | null>(null);

  const { isDragging, isDraggingRef, handleDrag, dragPreview } = useDragUI({
    iconRender,
    selectedMap: tempSelectedMapRef.current,
    addEventListener,
    config,
  });

  /**
   * 用于开启拖拽到 mainPanel 下打开资源的方法
   */
  const dragAndOpenResource = e => {
    if (!config?.resourceUriHandler) {
      return;
    }
    const uris = Object.values(tempSelectedMapRef.current)
      .filter(resource => resource.type !== ResourceTypeEnum.Folder)
      .map(resource => config.resourceUriHandler?.(resource))
      .filter(Boolean);

    if (!uris.length) {
      return;
    }

    dragService?.startDrag?.({
      uris: uris as URI[],
      position: {
        clientX: e.clientX,
        clientY: e.clientY,
      },
      callback: v => {
        //
      },
      backdropTransform: {
        /**
         * 通过边缘检测的方式，阻止  lm-cursor-backdrop  元素进入树组件内
         */
        clientX: (eventX: number) =>
          Math.max(
            eventX,
            (resourceTreeWrapperRef.current?.clientWidth || 0) + 100,
          ),
      },
    });
  };

  const startDrag = e => {
    if (draggable) {
      dragAndOpenResource(e);
      setDraggingError('');
      handleDrag(true);
    }
  };

  const stopDrag = () => {
    setDraggingError('');
    handleDrag(false);
  };

  const changeTempSelectedMap = (v: Record<string, ResourceType>) => {
    const values = Object.values(v);
    if (values.length === 1) {
      multiModeFirstSelected.current = values[0];
    } else if (values.length === 0) {
      multiModeFirstSelected.current = null;
    }
    tempSelectedMapRef.current = v;
    setTempSelectedMap(v);
  };

  const [currentHoverItem, setCurrentHoverItem] = useState<ResourceType | null>(
    null,
  );

  /**
   * 用于记录拖拽过程中，当前 hover 元素的 父元素 id。
   */
  const hoverItemParentId = useRef<string | null>(null);
  /**
   * 用于记录拖拽过程中，当前 hover 元素的 父元素及其下钻所有节点的id表
   */
  const [highlightItemMap, setHighlightItemMap] = useState<ResourceMapType>({});

  useEffect(() => {
    if (currentHoverItem?.id) {
      const parentId = getFolderIdFromPath(currentHoverItem);
      if (parentId !== hoverItemParentId.current) {
        const treeList = resourceMap.current[parentId]
          ? flatTree(
              resourceMap.current[parentId],
              resourceMap.current,
              collapsedMapRef.current,
            )
          : [];

        setHighlightItemMap(
          treeList.reduce(
            (pre, cur, index) => ({
              ...pre,
              [cur.id]: {
                ...cur,
              },
            }),
            {},
          ),
        );

        hoverItemParentId.current = parentId;
      }
    } else {
      hoverItemParentId.current = null;
      setHighlightItemMap({});
    }
  }, [currentHoverItem?.id]);

  const handleFocus = () => {
    updateId();
    setIsFocus(true);
    isFocusRef.current = true;
  };

  const handleBlur = () => {
    changeTempSelectedMap({});
    setIsFocus(false);
    isFocusRef.current = false;
  };

  const getCurrentDragResourceList = () => {
    let resourceList = Object.values(tempSelectedMapRef.current).filter(
      item => item.id !== ROOT_KEY,
    );

    /**
     * 将文件夹下的文件给过滤掉，防止拖拽之后失去层级结构
     */
    resourceList = resourceList.filter(resource => {
      const { type, path } = resourceMap.current[resource.id];
      if (type !== ResourceTypeEnum.Folder) {
        const resourcePath = path || [];
        return !(resourcePath || [])
          .slice(0, resourcePath.length - 1)
          .some(id => id !== ROOT_KEY && tempSelectedMapRef.current[id]);
      }
      return true;
    });

    return resourceList;
  };

  const onMouseDownInDiv = e => {
    if (disabled?.current) {
      return;
    }

    const target = findTargetElement(e.target, uniqId);
    if (!target) {
      return;
    }

    handleFocus();

    if (typeof target === 'object' && e.button === 0) {
      isMouseDownRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    // 这里要选中一次是保证拖动前选中正确的 item
    if (typeof target === 'object' && !e.shiftKey && !e.metaKey) {
      let currentSelected: ResourceType | null = null;

      if (target.id === ROOT_KEY) {
        currentSelected = ROOT_NODE;
      } else {
        currentSelected = resourceMap?.current?.[String(target?.id)] || {};
      }

      if (
        currentSelected?.id &&
        !tempSelectedMapRef.current?.[currentSelected.id]
      ) {
        changeTempSelectedMap({ [currentSelected.id]: currentSelected });
      }
    }
  };

  const onMouseDown = e => {
    if (disabled?.current || !isFocusRef.current) {
      return;
    }

    const target = findTargetElement(e.target, uniqId);

    stopDrag();

    if (!target || target === CLICK_OUTSIDE) {
      handleBlur();
      return;
    }

    // 点到右键的 panel 中 啥也别操作
    if (target === CLICK_CONTEXT_MENU) {
      return;
    }
  };

  const onMouseUpInDiv = e => {
    if (disabled?.current || isDraggingRef.current) {
      return;
    }

    const target = findTargetElement(e.target, uniqId, MORE_TOOLS_CLASS_NAME);

    if (typeof target === 'object' && target !== null) {
      let currentSelected: ResourceType | null = null;

      if (target.id === ROOT_KEY) {
        currentSelected = ROOT_NODE;
      } else {
        currentSelected = resourceMap?.current?.[String(target?.id)] || {};
      }

      /**
       * 如果点击了 more tools 三颗点，那需要先将临时选中表重置为只选中该 item。 用于右键菜单的消费。
       */
      if (target.customTag === MORE_TOOLS_CLASS_NAME) {
        const nextSelected = { [currentSelected.id]: currentSelected };
        changeTempSelectedMap(nextSelected);
        return;
      }

      // 如果右键， 并且点击在已经被选中的资源上，则不再做操作，因为要弹操作栏
      if (
        e.ctrlKey ||
        (e.button === 2 &&
          currentSelected?.id &&
          tempSelectedMapRef.current?.[currentSelected.id])
      ) {
        return;
      }

      if (e.shiftKey) {
        const firstSelectedId =
          multiModeFirstSelected.current?.id || selectedIdRef?.current;
        if (
          !firstSelectedId ||
          !currentSelected?.id ||
          firstSelectedId === currentSelected?.id
        ) {
          return;
        }

        // 批量一下子多选
        let nextSelected: any = getResourceListFromIdToId({
          resourceTree: resourceTreeRef.current,
          from: firstSelectedId,
          to: currentSelected.id,
          options: { collapsedMap: collapsedMapRef.current },
        });

        nextSelected = (nextSelected || []).reduce((prev, next) => {
          const id = typeof next === 'object' ? String(next.id) : String(next);
          return {
            ...prev,
            [id]: resourceMap?.current[id],
          } as any;
        }, {});

        if (nextSelected[ROOT_KEY]) {
          delete nextSelected[ROOT_KEY];
        }
        changeTempSelectedMap(nextSelected);
      } else if (e.metaKey) {
        // 挑着多选
        let nextSelected = { ...tempSelectedMapRef.current };
        if (currentSelected?.id) {
          if (nextSelected[currentSelected.id]) {
            delete nextSelected[currentSelected.id];
          } else {
            nextSelected = {
              ...nextSelected,
              [currentSelected.id]: currentSelected,
            };
          }
        }
        if (nextSelected[ROOT_KEY]) {
          delete nextSelected[ROOT_KEY];
        }
        changeTempSelectedMap(nextSelected);
      } else {
        if (currentSelected?.type && currentSelected.type !== 'folder') {
          onSelected?.(currentSelected.id, currentSelected as any);
        }
        if (currentSelected?.id) {
          changeTempSelectedMap({ [currentSelected.id]: currentSelected });
        }
      }
    }

    if (
      !isDraggingRef.current ||
      !Object.keys(tempSelectedMapRef.current).length
    ) {
      if (
        typeof target === 'object' &&
        target !== null &&
        target.id !== ROOT_KEY
      ) {
        if (e.button === 0 && !e.shiftKey && !e.metaKey) {
          setCollapsedMap(target.id, !collapsedMapRef.current[target.id]);
        }
      }
    }
  };

  const onMouseMove = e => {
    if (disabled?.current) {
      return;
    }

    if (!isMouseDownRef.current) {
      return;
    }

    const selectMapValue = Object.values(tempSelectedMapRef.current);

    if (selectMapValue.length === 0) {
      return;
    }

    if (selectMapValue.length === 1 && selectMapValue[0].id === ROOT_KEY) {
      return;
    }

    const isStartDrag =
      isDraggingRef.current ||
      canStartDrag(isMouseDownRef.current, {
        x: e.clientX,
        y: e.clientY,
      });

    if (!isStartDrag) {
      return;
    }

    /**
     * 开始拖拽
     */
    if (!isDraggingRef.current) {
      startDrag(e);
      return;
    }

    if (!resourceTreeWrapperRef.current) {
      return;
    }

    const target = getElementByXY({
      e,
      wrapperElm: resourceTreeWrapperRef.current,
      uniqId,
    });

    // 点到右键的 panel 中 啥也别操作
    if (target === CLICK_CONTEXT_MENU) {
      return;
    }

    if (!target) {
      setCurrentHoverItem(null);
      return;
    }
    if (target === CLICK_OUTSIDE || target === CLICK_TOOL_BAR) {
      setCurrentHoverItem(null);
      return;
    }

    if (typeof target === 'object' && target?.id !== currentHoverItem?.id) {
      if (target?.id === ROOT_KEY) {
        setCurrentHoverItem(ROOT_NODE);
      } else {
        setCurrentHoverItem(resourceMap.current[String(target?.id)]);
        const toId = getFolderIdFromPath(resourceMap.current[target.id]);
        const resourceList = getCurrentDragResourceList();
        const error = validateDrag(
          resourceList,
          resourceMap.current[toId],
          config,
        );
        setDraggingError(error);
      }
    }
  };

  const onMouseUp = e => {
    if (disabled?.current) {
      return;
    }

    if (
      isDraggingRef.current &&
      Object.keys(tempSelectedMapRef.current).length &&
      resourceTreeWrapperRef.current
    ) {
      const target = getElementByXY({
        e,
        wrapperElm: resourceTreeWrapperRef.current,
        uniqId,
      });

      // 点到右键的 panel 中 啥也别操作
      if (target === CLICK_CONTEXT_MENU || !target) {
        return;
      }

      if (typeof target === 'object') {
        const resourceList = getCurrentDragResourceList();

        const toId = getFolderIdFromPath(resourceMap.current[target.id]);

        const error = validateDrag(
          resourceList,
          resourceMap.current[toId],
          config,
        );

        if (error) {
          onDrag?.({ errorMsg: error });
        } else {
          onDrag?.({
            resourceList,
            toId,
          });
          setCollapsedMap(toId, false);
        }
      }

      stopDrag();
    }

    isMouseDownRef.current = null;

    setCurrentHoverItem(null);
  };

  useEffect(() => {
    addEventListener(EventKey.MouseDown, onMouseDown);
    addEventListener(EventKey.MouseDownInDiv, onMouseDownInDiv);
    addEventListener(EventKey.MouseUpInDiv, onMouseUpInDiv);
    addEventListener(EventKey.MouseUp, onMouseUp);
  }, []);

  const dataHandler = (resource: ResourceType) => ({
    [`data-${DATASET_PARENT_DATA_KEY_ID}`]: resource.id,
    [`data-${DATASET_RESOURCE_FOLDER_KEY}`]: uniqId,
  });

  return {
    context: {
      isDragging,
      draggingError,
      isFocus,
      dataHandler,
      tempSelectedMapRef,
      currentHoverItem,
      highlightItemMap,
    },
    isFocusRef,
    onMouseMove,
    dragPreview,
    handleFocus,
    handleBlur,
  };
};

export { useMouseEvent };
