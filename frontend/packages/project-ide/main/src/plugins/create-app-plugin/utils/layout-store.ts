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
 * layout data
 */
interface DBLayoutRow {
  /**
   * autoincrement id
   */
  id: number;
  /**
   * Space ID
   */
  spaceId: string;
  /**
   * Project ID
   */
  projectId: string;
  /**
   * timestamp
   */
  timestamp: number;
  /**
   * data version
   */
  version: number;
  /**
   * data
   */
  data: string;
}

type DBLayout = Dexie & {
  layout: EntityTable<DBLayoutRow, 'id'>;
};

/**
 * Version number of persistent storage form
 */
const VERSION = 3;

/**
 * database name
 */
const DB_NAME = 'CozProjectIDELayoutData';
/**
 * database version
 */
const DB_VERSION = 1;
/**
 * Data valid period
 */
const DB_EXPIRE = 1000 * 60 * 60 * 24 * 30;

let cache: DBLayout | undefined;

const isExpired = (row: DBLayoutRow) =>
  row.timestamp < Date.now() - DB_EXPIRE || row.version !== VERSION;

/**
 * Get the database instance
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
 * Save layout data
 * Note: The calling time is when the component is destroyed or the browser is closed, so asynchronous functions cannot be used
 */
const saveLayoutData = (spaceId: string, projectId: string, data: any) => {
  try {
    // No matter what the value is, it needs to be serialized into a string.
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
 * Read layout data
 * Data will be read from indexedDB and localStorage simultaneously, in the following cases:
 * 1. localStorage no data, return indexedDB data
 * 2. localStorage has data
 *  2.1. indexedDB no data, update indexedDB data, delete localStorage data, return indexedDB data
 *  2.2. IndexedDB has data, compare timestamps. Return recent data, delete localStorage data
 *    2.2.1. If localStorage data is new, update to indexedDB
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
