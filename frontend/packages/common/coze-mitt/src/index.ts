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
 * @Params to refresh the favorites list
 * @Params id - the bot id of the operation
 * @Params numDelta - Favorites change
 * @Params emitPosition - trigger location for event tracking, provenance, etc
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
 * transaction table
 *
 * Key is the event name and value is the parameter type
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- mitt can't use interface
type EventMap = {
  /**
   * Refresh Favorites List
   *
   * There is a collection list in the secondary navigation of the homepage and workspace, and the collection list needs to be refreshed in conjunction when the bot card is quickly collected.
   * Deleting the bot and migrating the bot also need to be refreshed, which is regarded as canceling the collection.
   *
   * @Params refreshFavList - Parameters to refresh the favorites list
   * @Params id - the bot id of the operation
   * @Params numDelta - Favorites change
   * @Params emitPosition - trigger location for event tracking, provenance, etc
   */
  refreshFavList: RefreshFavListParams;
  /**
   * New project in the left sidebar
   * This event is triggered when you select Create by Template and successfully create a task
   */
  createProjectByCopyTemplateFromSidebar: CreateProjectByCopyTemplateFromSidebarParam;
};

export type CozeMittEventType = keyof EventMap;

export const cozeMitt = mitt<EventMap>();
