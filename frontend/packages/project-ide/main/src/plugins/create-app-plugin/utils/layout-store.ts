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
 
import { Dexie, type EntityTable } from 'dexie';

/**
 * 布局数据
 */
interface DBLayoutRow {
  /**
   * 自增 id
   */
  id: number;
  /**
   * 空间 id
   */
  spaceId: string;
  /**
   * 项目 id
   */
  projectId: string;
  /**
   * 时间戳
   */
  timestamp: number;
  /**
   * 数据版本
   */
  version: number;
  /**
   * 数据
   */
  data: string;
}

type DBLayout = Dexie & {
  layout: EntityTable<DBLayoutRow, 'id'>;
};

/**
 * 持久化储存形式的版本号
 */
const VERSION = 3;

/**
 * 数据库名称
 */
const DB_NAME = 'CozProjectIDELayoutData';
/**
 * 数据库版本
 */
const DB_VERSION = 1;
/**
 * 数据有效期
 */
const DB_EXPIRE = 1000 * 60 * 60 * 24 * 30;

let cache: DBLayout | undefined;

const isExpired = (row: DBLayoutRow) =>
  row.timestamp < Date.now() - DB_EXPIRE || row.version !== VERSION;

/**
 * 获取数据库实例
 */
const getDB = () => {
  if (!cache) {
    cache = new Dexie(DB_NAME) as DBLayout;
    cache.version(DB_VERSION).stores({
      layout: '++id, spaceId, projectId, timestamp, data',
    });
  }
  return cache;
};

const setDataDB = async (
  spaceId: string,
  projectId: string,
  row: Omit<DBLayoutRow, 'id' | 'projectId' | 'spaceId'>,
) => {
  const db = getDB();
  const record = await db.layout.where({ spaceId, projectId }).first();
  if (record) {
    await db.layout.update(record.id, {
      ...row,
    });
  } else {
    await db.layout.add({
      spaceId,
      projectId,
      ...row,
    });
  }
};

const getDataDB = async (spaceId: string, projectId: string) => {
  const db = getDB();
  const record = await db.layout.where({ spaceId, projectId }).first();

  if (!record) {
    return undefined;
  }
  if (isExpired(record)) {
    await db.layout.where({ id: record.id }).delete();
    return undefined;
  }
  return record;
};

const LOCAL_STORAGE_KEY_PREFIX = 'coz-project-ide-layout-data';

const setDataLS = (
  spaceId: string,
  projectId: string,
  row: Omit<DBLayoutRow, 'id' | 'projectId' | 'spaceId'>,
) => {
  const key = `${LOCAL_STORAGE_KEY_PREFIX}-${spaceId}-${projectId}`;
  window.localStorage.setItem(key, JSON.stringify(row));
};

const getDataLS = (spaceId: string, projectId: string) => {
  const key = `${LOCAL_STORAGE_KEY_PREFIX}-${spaceId}-${projectId}`;
  const str = window.localStorage.getItem(key);
  if (!str) {
    return undefined;
  }
  try {
    const data = JSON.parse(str);
    if (isExpired(data)) {
      window.localStorage.removeItem(key);
      return undefined;
    }
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
const deleteDataLS = (spaceId: string, projectId: string) => {
  const key = `${LOCAL_STORAGE_KEY_PREFIX}-${spaceId}-${projectId}`;
  window.localStorage.removeItem(key);
};

/**
 * 保存布局数据
 * 注：调用时机为组件销毁或浏览器关闭时，故不可用异步函数
 */
const saveLayoutData = (spaceId: string, projectId: string, data: any) => {
  try {
    // 无论是什么值都需要序列化成字符串
    const str = JSON.stringify(data);
    const row = {
      data: str,
      timestamp: Number(Date.now()),
      version: VERSION,
    };
    setDataLS(spaceId, projectId, row);
    setDataDB(spaceId, projectId, row);
  } catch (e) {
    console.error(e);
  }
};

/**
 * 读取布局数据
 * 会同时从 indexedDB 和 localStorage 中读取数据，会有以下几种情况：
 * 1. localStorage 无数据，返回 indexedDB 数据
 * 2. localStorage 有数据
 *  2.1. indexedDB 无数据，更新 indexedDB 数据，删除 localStorage 数据，返回 indexedDB 数据
 *  2.2. indexedDB 有数据，比较时间戳。返回最近的数据，删除 localStorage 数据
 *    2.2.1. 若 localStorage 数据较新，则更新到 indexedDB 中
 */
const readLayoutData = async (spaceId: string, projectId: string) => {
  let str;
  const recordDB = await getDataDB(spaceId, projectId);
  const recordLS = getDataLS(spaceId, projectId);
  if (!recordLS) {
    str = recordDB?.data;
  } else if (!recordDB || recordDB.timestamp < recordLS.timestamp) {
    await setDataDB(spaceId, projectId, recordLS);
    deleteDataLS(spaceId, projectId);
    str = recordLS.data;
  } else {
    deleteDataLS(spaceId, projectId);
    str = recordDB.data;
  }
  if (!str) {
    return undefined;
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

export { saveLayoutData, readLayoutData };
