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

import { logger } from '@coze-arch/logger';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { getBotDetailIsReadonly } from '../utils/get-read-only';
import { useBotInfoStore } from '../store/bot-info';
import { useCollaborationStore } from './collaboration';

export const collaborateQuota = async () => {
  try {
    const { botId } = useBotInfoStore.getState();
    const { inCollaboration, setCollaboration } =
      useCollaborationStore.getState();
    const {
      space: { space_type },
    } = useSpaceStore.getState();
    const isPersonal = space_type === SpaceType.Personal;

    const isReadOnly = getBotDetailIsReadonly();
    if (isReadOnly || isPersonal) {
      return;
    }
    const { data: collaborationQuota } =
      await PlaygroundApi.GetBotCollaborationQuota({
        bot_id: botId,
      });
    setCollaboration({
      // Multiplayer collaboration mode, or non-multiplayer collaboration mode can be enabled when there is a quota
      openCollaboratorsEnable:
        (!inCollaboration && collaborationQuota?.open_collaborators_enable) ||
        inCollaboration,
      // Non-multiplayer collaboration mode & & If the package can be upgraded, the upgrade package button will be displayed.
      canUpgrade: collaborationQuota?.can_upgrade || false,
      // Limit on the maximum number of user-enabled multiplayer collaborative bots
      maxCollaborationBotCount:
        collaborationQuota?.max_collaboration_bot_count || 0,
      maxCollaboratorsCount: collaborationQuota?.max_collaborators_count || 0,
      currentCollaborationBotCount:
        collaborationQuota.current_collaboration_bot_count || 0,
    });
  } catch (error) {
    const e = error instanceof Error ? error : new Error(error as string);
    logger.error({ error: e });
  }
};
