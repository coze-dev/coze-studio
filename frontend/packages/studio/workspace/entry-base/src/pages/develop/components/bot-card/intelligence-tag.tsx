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

import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
export interface IntelligenceTagProps {
  intelligenceType: IntelligenceType | undefined;
}

export const IntelligenceTag: React.FC<IntelligenceTagProps> = ({
  intelligenceType,
}) => {
  if (intelligenceType === IntelligenceType.Project) {
    return (
      <Tag color="brand" size="small" className="w-fit">
        {I18n.t('develop_list_card_tag_project')}
      </Tag>
    );
  }
  if (intelligenceType === IntelligenceType.Bot) {
    return (
      <Tag color="primary" size="small" className="w-fit">
        {I18n.t('develop_list_card_tag_agent')}
      </Tag>
    );
  }
  if (intelligenceType === IntelligenceType.DouyinAvatarBot) {
    return (
      <Tag color="red" size="small" className="w-fit">
        {/* TODO: i18n copywriting */}
        抖音分身
      </Tag>
    );
  }
  return null;
};
