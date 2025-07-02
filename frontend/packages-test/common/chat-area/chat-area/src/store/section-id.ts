import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

interface SectionIdState {
  prevSectionId: string;
  latestSectionId: string;
}

interface SectionIdAction {
  setLatestSectionId: (id: string) => void;
  clear: () => void;
}

export const createSectionIdStore = (mark: string) =>
  create<SectionIdState & SectionIdAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        latestSectionId: '',
        prevSectionId: '',
        setLatestSectionId: id => {
          const { latestSectionId: prevSectionId } = get();
          set(
            { latestSectionId: id, prevSectionId },
            false,
            'setLatestSectionId',
          );
        },
        clear: () => set({ latestSectionId: '' }, false, 'clear'),
      })),
      {
        name: `botStudio.ChatAreaSectionId.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type SectionIdStore = ReturnType<typeof createSectionIdStore>;
