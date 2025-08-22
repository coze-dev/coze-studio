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

import { useShallow } from 'zustand/react/shallow';
import { useModelStore as useBotDetailModelStore } from '@coze-studio/bot-detail-store/model';
import {
  getModelById,
  useBotEditor,
} from '@coze-agent-ide/bot-editor-context-store';

export const useGetSingleAgentCurrentModel = () => {
  const {
    storeSet: { useModelStore },
  } = useBotEditor();

  const { onlineModelList, offlineModelMap } = useModelStore(
    useShallow(state => ({
      onlineModelList: state.onlineModelList,
      offlineModelMap: state.offlineModelMap,
    })),
  );
  const { model } = useBotDetailModelStore(state => state.config);
  
  const currentModel = getModelById({
    onlineModelList,
    offlineModelMap,
    id: model ?? '',
  });

  // 如果当前模型不存在且有可用模型，返回第一个可用模型作为fallback
  // 注意：这里只返回模型信息，不修改store状态，状态修改在组件层处理
  if (!currentModel && onlineModelList.length > 0) {
    return onlineModelList[0];
  }

  return currentModel;
};
