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

import { useState, useCallback } from 'react';

const MINIMAP_VISIBLE_KEY = 'workflow-minimap-visible';

const getMinimapStorageVisible = () => {
  const visible = localStorage.getItem(MINIMAP_VISIBLE_KEY) ?? 'false';
  return visible === 'true';
};

const setMinimapStorageVisible = (visible: boolean) => {
  localStorage.setItem(MINIMAP_VISIBLE_KEY, visible ? 'true' : 'false');
};

export const useMinimapVisible = () => {
  const [minimapVisible, setMinimapStateVisible] = useState(
    getMinimapStorageVisible(),
  );

  const setMinimapVisible = useCallback((visible: boolean) => {
    setMinimapStateVisible(visible);
    setMinimapStorageVisible(visible);
  }, []);

  return {
    minimapVisible,
    setMinimapVisible,
  };
};
