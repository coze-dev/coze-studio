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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface RiskStore {
  pluginRiskIsRead: boolean;
  toolHiddenModeNewbieGuideIsRead: boolean;
}

interface RiskAction {
  reset: () => void;
  setPluginRiskIsRead: (flag: boolean) => void;
  setToolHiddenModeNewbieGuideIsRead: (flag: boolean) => void;
}

const initialStore: RiskStore = {
  pluginRiskIsRead: true,
  toolHiddenModeNewbieGuideIsRead: true,
  // Support for expanding other risk alerts...
};

export const useRiskWarningStore = create<RiskStore & RiskAction>()(
  devtools(
    set => ({
      ...initialStore,
      reset: () => {
        set(initialStore);
      },
      setPluginRiskIsRead: flag => {
        set({ pluginRiskIsRead: flag });
      },
      setToolHiddenModeNewbieGuideIsRead: flag => {
        set({
          toolHiddenModeNewbieGuideIsRead: flag,
        });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.riskWarningStore',
    },
  ),
);
