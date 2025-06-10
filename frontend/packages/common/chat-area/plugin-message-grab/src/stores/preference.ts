import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

export interface PreferenceState {
  enableGrab: boolean;
}

export interface PreferenceAction {
  updateEnableGrab: (enable: boolean) => void;
}

export const createPreferenceStore = (mark: string) => {
  const usePreferenceStore = create<PreferenceState & PreferenceAction>()(
    devtools(
      subscribeWithSelector(set => ({
        enableGrab: false,
        updateEnableGrab: enable => {
          set({
            enableGrab: enable,
          });
        },
      })),
      {
        name: `botStudio.ChatAreaGrabPlugin.Preference.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return usePreferenceStore;
};

export type PreferenceStore = ReturnType<typeof createPreferenceStore>;
