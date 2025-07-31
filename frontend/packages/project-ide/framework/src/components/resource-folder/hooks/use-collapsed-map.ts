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

import { useEffect } from 'react';

import { useStateRef } from './uss-state-ref';

const useCollapsedMap = ({ _collapsedMap, _setCollapsedMap, resourceMap }) => {
  const [collapsedMapRef, setCollapsedMap, collapsedState] = useStateRef(
    _collapsedMap || {},
  );

  useEffect(() => {
    if (_collapsedMap) {
      setCollapsedMap(_collapsedMap);
    }
  }, [_collapsedMap]);

  const setCollapsed = v => {
    _setCollapsedMap?.(v);
    if (!_collapsedMap) {
      setCollapsedMap(v);
    }
  };

  const handleCollapse = (id, v) => {
    if (resourceMap.current?.[id]?.type === 'folder') {
      setCollapsed({
        ...collapsedMapRef.current,
        [id]: v,
      });
    }
  };

  return { handleCollapse, collapsedMapRef, setCollapsed, collapsedState };
};

export { useCollapsedMap };
