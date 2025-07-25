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
 * 缓存列宽的方法类
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
   * 初始化伸缩列缓存
   */
  initWidthMap() {
    const widthMap = window.localStorage.getItem(this.mapName);
    if (!widthMap) {
      // 利用Map可记录键值对顺序的特性完成一个简易的LRU
      window.localStorage.setItem(this.mapName, this.mapToString(new Map()));
    }
  }

  /**
   * 设置列宽缓存,若超过缓存个数，删除map中最近未使用的值
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
        // 存在即更新（删除后加入）
        cacheWidthMap.delete(tableKey);
      } else if (cacheWidthMap.size >= this.capacity) {
        // 不存在即加入
        // 缓存超过最大值，则移除最近没有使用的
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
   * 以表维度查询列宽缓存信息
   * @param tableKey
   */
  getTableWidthMap(tableKey: string) {
    try {
      const cacheWidthMap = this.stringToMap(
        window.localStorage.getItem(this.mapName) || '',
      );
      // 存在即更新
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
