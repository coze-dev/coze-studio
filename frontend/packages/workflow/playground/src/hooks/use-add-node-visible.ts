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

/**
 * Add the display hidden state of the node panel on the left, which needs to be consumed elsewhere, so it is abstracted into a global state.
 */

import { create } from 'zustand';

interface AddNodeVisibleStore {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useAddNodeVisibleStore = create<AddNodeVisibleStore>(set => ({
  visible: true,
  setVisible: visible => set({ visible }),
}));
