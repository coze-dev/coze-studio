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
 
import mitt from 'mitt';

/**
 * @params 刷新收藏列表的参数
 * @params id - 操作的 bot id
 * @params numDelta - 收藏数变化量
 * @params emitPosition - 触发位置，用于埋点、判断来源等
 */
export interface RefreshFavListParams {
  id?: string;
  numDelta: number;
  emitPosition?: string;
}

export interface CreateProjectByCopyTemplateFromSidebarParam {
  toSpaceId: string;
}

/**
 * 事件表
 *
 * key 为事件名称，value 为参数类型
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt 无法使用 interface
type EventMap = {
  /**
   * 刷新收藏列表
   *
   * 首页和工作空间的二级导航有收藏列表，需要在 bot 卡片快捷收藏时联动刷新收藏列表
   * 删除 bot、迁移 bot 也需要刷新，视作取消收藏
   *
   * @params refreshFavList - 刷新收藏列表的参数
   * @params id - 操作的 bot id
   * @params numDelta - 收藏数变化量
   * @params emitPosition - 触发位置，用于埋点、判断来源等
   */
  refreshFavList: RefreshFavListParams;
  /**
   * 左侧侧边栏进行项目新建
   * 选择通过模版创建并且成功创建任务时触发此事件
   */
  createProjectByCopyTemplateFromSidebar: CreateProjectByCopyTemplateFromSidebarParam;
};

export type CozeMittEventType = keyof EventMap;

export const cozeMitt = mitt<EventMap>();
