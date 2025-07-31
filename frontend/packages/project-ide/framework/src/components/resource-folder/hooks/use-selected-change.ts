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

import { useEffect, useRef } from 'react';

const useSelectedChange = ({
  selected,
  resourceMap,
  collapsedMapRef,
  setCollapsed,
  tempSelectedMapRef,
  setTempSelectedMap,
  scrollInView,
  updateContext,
}) => {
  const selectedIdRef = useRef<string>(selected || '');

  useEffect(() => {
    if (!selected) {
      setTempSelectedMap({});
      return;
    }
    selectedIdRef.current = selected;

    updateContext({ currentSelectedId: selected });

    // Expand folders on the focused path
    const path = resourceMap.current[selected]?.path || [];
    path.forEach(pathKey => {
      delete collapsedMapRef.current[pathKey];
    });
    setCollapsed({
      ...collapsedMapRef.current,
    });

    tempSelectedMapRef.current = {};
    if (resourceMap.current?.[selected]) {
      tempSelectedMapRef.current = {
        [selected]: resourceMap.current[selected],
      };
    }
    setTempSelectedMap(tempSelectedMapRef.current);

    setTimeout(() => {
      scrollInView(selected);
    }, 16);
  }, [selected]);

  return selectedIdRef;
};

export { useSelectedChange };
