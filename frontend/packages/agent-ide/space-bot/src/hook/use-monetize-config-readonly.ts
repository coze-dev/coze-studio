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
 
import { userStoreService } from '@coze-studio/user-store';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';

/**
 * bot 付费配置是否可编辑
 *
 * 与 bot 是否可编辑的区别：作者本人可以编辑，有 bot 编辑权限的协作者也无法修改付费配置
 */
export function useMonetizeConfigReadonly() {
  const userId = userStoreService.useUserInfo()?.user_id_str;
  const botCreatorId = useBotInfoStore(s => s.creator_id);
  const botDetailReadonly = useBotDetailIsReadonly();
  const isSelf = userId === botCreatorId;
  return botDetailReadonly || !isSelf;
}
