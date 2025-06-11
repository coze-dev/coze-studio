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
