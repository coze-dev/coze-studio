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

import { useState } from 'react';

import { localStorageService } from '@coze-foundation/local-storage';

const SESSION_HIDDEN_KEY = 'coze-project-entity-hidden-key';

export const useHiddenSession = (key: string) => {
  const [isSessionHidden, setIsSessionHidden] = useState(isKeyExist(key));
  return {
    isSessionHidden,
    hideSession: () => {
      if (isKeyExist(key)) {
        return;
      }
      const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY) || '';
      localStorageService.setValue(
        SESSION_HIDDEN_KEY,
        oldValue ? `${oldValue},${key}` : key,
      );
      setIsSessionHidden(true);
    },
  };
};

const isKeyExist = (key: string) => {
  const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY);
  return oldValue?.includes(key);
};
