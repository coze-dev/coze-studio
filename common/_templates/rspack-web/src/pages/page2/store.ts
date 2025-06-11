import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface Page1State {
  count: number;
  updateCount: () => void;
}

// only for page2
export const usePage2Store = create<Page1State>()(
  devtools(
    immer(set => ({
      count: 1,
      updateCount: () => {
        set(it => {
          it.count++;
        });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'api-builder/page2',
    },
  ),
);
