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
 * 左侧添加节点面板的显示隐藏状态，需要被别的地方消费，所以抽象成一个全局 state
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
