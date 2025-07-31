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

import { logger } from '@coze-arch/logger';

import { type FEATURE_FLAGS } from '../types';
import { PACKAGE_NAMESPACE } from '../constant';
import { nextTick } from './wait';

const PERSIST_CACHE_KEY = 'cache:@coze-arch/bot-flags';

const isFlagsShapeObj = (obj: unknown) => {
  if (typeof obj === 'object') {
    const shape = obj as FEATURE_FLAGS;
    return (
      // If any property value is not a boolean, it is not considered a flags object
      Object.keys(shape).some(r => typeof shape[r] !== 'boolean') === false
    );
  }
  return false;
};

export const readFromCache = async (): Promise<FEATURE_FLAGS | undefined> => {
  await Promise.resolve(undefined);
  const content = window.localStorage.getItem(PERSIST_CACHE_KEY);
  if (!content) {
    return undefined;
  }
  try {
    const res = JSON.parse(content);
    if (isFlagsShapeObj(res)) {
      return res;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveToCache = async (flags: FEATURE_FLAGS) => {
  await nextTick();
  try {
    if (isFlagsShapeObj(flags)) {
      const content = JSON.stringify(flags);
      window.localStorage.setItem(PERSIST_CACHE_KEY, content);
    }
  } catch (e) {
    // do nothing
    logger.persist.error({
      namespace: PACKAGE_NAMESPACE,
      message: 'save fg failure',
      error: e as Error,
    });
  }
};
