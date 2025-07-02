import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';
import { ItemTypeExtra } from '../types';

export const updateShortcutSort = async (shortcutSort: string[]) =>
  await saveFetcher(
    () =>
      updateBotRequest({
        shortcut_sort: shortcutSort,
      }),

    ItemTypeExtra.Shortcut,
  );
