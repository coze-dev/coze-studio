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
