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
  // This is fallback
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
