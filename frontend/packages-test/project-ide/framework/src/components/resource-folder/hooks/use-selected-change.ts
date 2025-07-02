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

    // 将聚焦的 path 上的文件夹都展开
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
