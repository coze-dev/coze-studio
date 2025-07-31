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

interface EvaluationPaneState {
  isEvaluationPanelVisible: boolean;
}

interface EvaluationPaneAction {
  setIsEvaluationPanelVisible: (visible: boolean) => void;
}

const DEFAULT_EVALUATION_PANEL_STORE = (): EvaluationPaneState => ({
  isEvaluationPanelVisible: false,
});

export const useEvaluationPanelStore = create<
  EvaluationPaneState & EvaluationPaneAction
>()(
  devtools(
    set => ({
      ...DEFAULT_EVALUATION_PANEL_STORE(),
      setIsEvaluationPanelVisible: visible => {
        set({ isEvaluationPanelVisible: visible });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.evaluationPanelStore',
    },
  ),
);
