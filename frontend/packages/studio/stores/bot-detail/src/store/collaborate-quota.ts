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
      // 多人协作模式，或非多人协作模式有额度时可启用
      openCollaboratorsEnable:
        (!inCollaboration && collaborationQuota?.open_collaborators_enable) ||
        inCollaboration,
      // 非多人协作模式 && 可以升级套餐，则展示升级套餐按钮
      canUpgrade: collaborationQuota?.can_upgrade || false,
      // 用户最大开启多人协作bot的数量限制
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
