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
