import { produce } from 'immer';
import {
  type IntelligenceBasicInfo,
  type IntelligenceData,
  type User,
} from '@coze-arch/idl/intelligence_api';
import { getUserInfo, getUserLabel } from '@coze-foundation/account-adapter';

export const produceCopyIntelligenceData = ({
  originTemplateData,
  newCopyData,
}: {
  originTemplateData: IntelligenceData;
  newCopyData: {
    ownerInfo: User | undefined;
    basicInfo: IntelligenceBasicInfo;
  };
}) => {
  // 这是 fallback
  const userInfo = getUserInfo();
  const userLabel = getUserLabel();
  return produce<IntelligenceData>(originTemplateData, draft => {
    const { type } = draft;
    const { ownerInfo, basicInfo } = newCopyData;
    return {
      type,
      owner_info: ownerInfo || {
        user_id: userInfo?.user_id_str,
        nickname: userInfo?.name,
        avatar_url: userInfo?.avatar_url,
        user_unique_name: userInfo?.app_user_info.user_unique_name,
        user_label: userLabel || undefined,
      },
      basic_info: basicInfo,
      permission_info: {
        in_collaboration: false,
        can_delete: true,
        can_view: true,
      },
    };
  });
};
