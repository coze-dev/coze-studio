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
import { type ConfigType, type IdType, type ResourceType } from '../../type';
import { MAX_DEEP, ROOT_KEY, ROOT_NODE } from '../../constant';

const DATASET_RESOURCE_FOLDER_KEY = 'resource_folder_key';
const DATASET_PARENT_DATA_STOP_TAG = 'resource_folder_drag_and_drop_stop_tag';
const DATASET_PARENT_DATA_KEY_ID = 'resource_folder_drag_and_drop_id';

const TOOL_BAR_CLASS_NAME = 'resource_folder_tool_bar_class_name';
const CLICK_TOOL_BAR = 'click_tool_bar';

const CLICK_OUTSIDE = 'click_outside';

const CLICK_CONTEXT_MENU = 'click_context_menu';

const PATH_SPLIT_KEY = '-$$-';

const START_DRAG_GAP = 10;

export interface MousePosition {
  x: number;
  y: number;
}

const isPointInRect = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number },
) =>
  point.x > rect.x &&
  point.x < rect.x + rect.width &&
  point.y > rect.y &&
  point.y < rect.y + rect.height;

const BORDER_GAP = 8; // 默认边缘阈值
/**
 * 相对于 findTargetElement ，增加了边缘检测功能。
 * 当鼠标在 资源目录边缘， 会算作聚焦在 root 节点
 */
const getElementByXY = ({
  e,
  wrapperElm,
  uniqId,
}: {
  e: MouseEvent;
  wrapperElm: HTMLDivElement;
  uniqId: string;
}) => {
  const { pageX, pageY } = e;
  const { x, y, width, height } = wrapperElm.getBoundingClientRect();

  if (
    isPointInRect({ x: pageX, y: pageY }, { x, y, width, height }) &&
    !isPointInRect(
      { x: pageX, y: pageY },
      {
        x: x + BORDER_GAP,
        y: y + BORDER_GAP,
        width: width - BORDER_GAP * 2,
        height: height - BORDER_GAP * 2,
      },
    )
  ) {
    return ROOT_NODE;
  }

  return findTargetElement(e.target as HTMLElement, uniqId);
};

type TargetType =
  | {
      id: IdType;
      customTag?: string;
    }
  | null
  | typeof CLICK_OUTSIDE
  | typeof CLICK_CONTEXT_MENU
  | typeof CLICK_TOOL_BAR;

const findTargetElement = (
  elm: HTMLElement | null,
  uniqueId: string,
  /**
   * 遇到该 className 会进行记录，并且返回 id 的时候会带上该 className
   */
  customClassName?: string,
): TargetType | string => {
  const extraProps: {
    customTag?: string;
  } = {};

  if (customClassName && elm?.classList?.contains?.(customClassName)) {
    extraProps.customTag = customClassName;
  }
  if (!elm) {
    return CLICK_OUTSIDE;
  }

  if (
    elm.dataset?.[DATASET_PARENT_DATA_KEY_ID] !== undefined &&
    elm.dataset?.[DATASET_RESOURCE_FOLDER_KEY] === uniqueId
  ) {
    return {
      id: elm.dataset[DATASET_PARENT_DATA_KEY_ID],
      ...extraProps,
    };
  } else if (
    elm.dataset?.[DATASET_PARENT_DATA_STOP_TAG] &&
    elm.dataset[DATASET_RESOURCE_FOLDER_KEY] === uniqueId
  ) {
    return {
      id: ROOT_KEY,
      ...extraProps,
    };
  } else if (elm.classList.contains(TOOL_BAR_CLASS_NAME)) {
    return CLICK_TOOL_BAR;
  }
  const result = findTargetElement(
    elm.parentElement,
    uniqueId,
    customClassName,
  );
  if (typeof result === 'object' && result !== null) {
    return {
      ...result,
      ...extraProps,
    };
  }
  return result;
};

const getFolderIdFromPath = (resource: ResourceType | null): string => {
  if (!resource) {
    return '';
  }
  if (resource.type === 'folder') {
    return String(resource.id);
  } else {
    return String(resource.path?.[resource.path.length - 2]);
  }
};

const canStartDrag = (
  startPosition: MousePosition,
  currentPosition: MousePosition,
): boolean => {
  if (
    Math.abs(currentPosition.x - startPosition.x) > START_DRAG_GAP ||
    Math.abs(currentPosition.y - startPosition.y) > START_DRAG_GAP
  ) {
    return true;
  }
  return false;
};

const validateDrag = (
  resourceList: ResourceType[],
  target: ResourceType,
  config?: ConfigType,
) => {
  const { name, path, id } = target;

  /**
   * 只要有一个文件是自己层级挪动到自己层级的则 return
   */
  const selfList = resourceList.filter(resource => {
    const resourcePath = resource.path || [];
    const parentId = resourcePath[resourcePath.length - 2];
    return parentId === id;
  });
  if (selfList.length) {
    return `Can't move ${selfList
      .map(item => item.name)
      .join(', ')} into ${name}`;
  }

  // 校验是不是爹移到儿子
  const notAllowedList = resourceList.filter(resource =>
    (path || []).includes(String(resource.id)),
  );

  if (notAllowedList.length) {
    return `Can't move ${notAllowedList
      .map(item => item.name)
      .join(', ')} into ${name}`;
  }

  // 校验移动之后层级是不是过深
  const maxDeep = resourceList.reduce(
    (max, resource) => Math.max(max, (resource?.maxDeep || 0) + 1),
    0,
  );
  const targetDeep = (target.path || []).length - 1;

  if (targetDeep + maxDeep > (config?.maxDeep || MAX_DEEP)) {
    return `Can't move into ${name}. MaxDeep is ${config?.maxDeep || MAX_DEEP}`;
  }

  return '';
};

export {
  DATASET_PARENT_DATA_STOP_TAG,
  DATASET_PARENT_DATA_KEY_ID,
  DATASET_RESOURCE_FOLDER_KEY,
  CLICK_CONTEXT_MENU,
  TOOL_BAR_CLASS_NAME,
  CLICK_TOOL_BAR,
  CLICK_OUTSIDE,
  PATH_SPLIT_KEY,
  findTargetElement,
  getElementByXY,
  getFolderIdFromPath,
  validateDrag,
  canStartDrag,
};
