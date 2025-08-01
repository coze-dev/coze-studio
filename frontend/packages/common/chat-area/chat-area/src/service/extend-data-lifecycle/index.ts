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

/**
 * This module is used to extend the lifecycle of chat area data
 */

import { type Scene } from '@coze-common/chat-core';

import { type InitService } from '../init-service';
import { type StoreSet } from '../../context/chat-area-context/type';

type Data = StoreSet;
/** Make use of it first, and you can only see that coze homes have this demand in a short time. */
type Biz = Scene;

const map = new Map<Biz, Data>();

const initServiceMap = new Map<Biz, InitService>();

export const recordLifecycleExtendedData = (biz: Biz, data: Data) => {
  if (IS_DEV_MODE && map.has(biz)) {
    throw new Error(`set data again ${biz}!`);
  }
  map.set(biz, data);
};

export const retrieveAndClearLifecycleExtendedData = (biz: Biz) => {
  const res = map.get(biz);
  if (!res) {
    return null;
  }
  map.delete(biz);
  return res;
};

export const retrieveLifecycleExtendedData = (biz: Biz) => {
  const res = map.get(biz);
  if (!res) {
    return null;
  }
  return res;
};

export const clearExtendedLifecycleData = (biz: Biz) => {
  map.delete(biz);
  initServiceMap.delete(biz);
};

export const recordInitServiceController = (
  biz: Biz,
  initService: InitService,
) => {
  if (IS_DEV_MODE && map.has(biz)) {
    throw new Error(`set data again ${biz}!`);
  }
  initServiceMap.set(biz, initService);
};

export const retrieveAndClearInitService = (biz: Biz) => {
  const res = initServiceMap.get(biz);
  if (!res) {
    return null;
  }
  initServiceMap.delete(biz);
  return res;
};
