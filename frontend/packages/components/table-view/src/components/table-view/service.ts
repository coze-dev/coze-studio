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

import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

/**
 * Method class with cache column width
 */

class ColWidthCacheService {
  public mapName: string;
  public capacity: number;

  constructor() {
    this.mapName = 'TABLE_VIEW_COL_WIDTH_MAP';
    this.capacity = 20;
  }
  private mapToString(map: Map<string, Record<string, number>>) {
    const mapArr = Array.from(map);
    return JSON.stringify(mapArr);
  }

  private stringToMap(v: string) {
    const mapArr = JSON.parse(v);
    return mapArr.reduce(
      (
        map: Map<string, Record<string, number>>,
        [key, value]: [string, Record<string, number>],
      ) => map.set(key, value),
      new Map(),
    );
  }

  /**
   * Initializing the scaled column cache
   */
  initWidthMap() {
    const widthMap = window.localStorage.getItem(this.mapName);
    if (!widthMap) {
      // Completing a simple LRU using the characteristic that Map can record the order of key-value pairs
      window.localStorage.setItem(this.mapName, this.mapToString(new Map()));
    }
  }

  /**
   * Set the column width cache, if it exceeds the number of caches, delete the most recently unused value in the map
   */
  setWidthMap(widthMap: Record<string, number>, tableKey?: string) {
    if (!tableKey) {
      return;
    }
    try {
      const cacheWidthMap = this.stringToMap(
        window.localStorage.getItem(this.mapName) || '',
      );
      if (cacheWidthMap.has(tableKey)) {
        // Exist and update (join after deletion)
        cacheWidthMap.delete(tableKey);
      } else if (cacheWidthMap.size >= this.capacity) {
        // Join if you don't exist
        // If the cache exceeds the maximum value, remove the recently unused
        cacheWidthMap.delete(cacheWidthMap.keys().next().value);
      }
      cacheWidthMap.set(tableKey, widthMap);
      window.localStorage.setItem(
        this.mapName,
        this.mapToString(cacheWidthMap),
      );
    } catch (err) {
      throw new CustomError(
        REPORT_EVENTS.KnowledgeTableViewSetColWidth,
        `table view set width map fail: ${err}`,
      );
    }
  }

  /**
   * Query column width cache information in table dimension
   * @param tableKey
   */
  getTableWidthMap(tableKey: string) {
    try {
      const cacheWidthMap = this.stringToMap(
        window.localStorage.getItem(this.mapName) || '',
      );
      // exist and update
      const temp = cacheWidthMap.get(tableKey);
      cacheWidthMap.delete(tableKey);
      cacheWidthMap.set(tableKey, temp);
      return temp;
    } catch (err) {
      throw new CustomError(
        REPORT_EVENTS.KnowledgeTableViewGetColWidth,
        `table view get width map fail: ${err}`,
      );
    }
  }
}

export const colWidthCacheService = new ColWidthCacheService();
