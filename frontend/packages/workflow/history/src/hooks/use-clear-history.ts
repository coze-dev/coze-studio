import { useCallback } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { HistoryService } from '@flowgram-adapter/common';

/**
 * 清空undo redo历史栈
 * @returns
 */
export function useClearHistory(): {
  clearHistory: () => void;
} {
  const historyService = useService<HistoryService>(HistoryService);

  const clearHistory = useCallback(() => {
    historyService.clear();
  }, []);

  return {
    clearHistory,
  };
}
