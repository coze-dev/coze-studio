import { useEffect } from 'react';

import { createLocateChunkId } from '../../services/locate-segment';

/**
 * 滚动到选中的元素
 * @param selectionIDs 选中的元素ID数组
 */
export const useScrollToSelection = (selectionIDs?: string[]) => {
  useEffect(() => {
    if (selectionIDs?.length) {
      const firstSelectedId = selectionIDs[0];
      const element = document.getElementById(
        createLocateChunkId(firstSelectedId),
      );
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectionIDs]);
};
