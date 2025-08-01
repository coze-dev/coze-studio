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

import { AvatarName } from '@coze-studio/components';
import { type UserInfo } from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Image, Typography } from '@coze-arch/coze-design';

export interface TemplatePreviewCardProps {
  userInfo?: UserInfo;
  cover?: string;
  name?: string;
  description?: string;
}

// Basically copied packages/studio/template/pages/src/components/template-list-card/index.tsx
export function TemplatePreviewCard({
  userInfo,
  cover,
  name,
  description,
}: TemplatePreviewCardProps) {
  const userLabel = userInfo?.user_label
    ? {
        name: userInfo.user_label.label_name,
        icon: userInfo.user_label.icon_url,
        href: userInfo.user_label.jump_link,
      }
    : undefined;

  return (
    <div className="flex flex-col overflow-hidden p-[12px] pb-[16px] rounded-[16px] border border-solid coz-stroke-primary coz-bg-max coz-shadow-small">
      <div className="relative w-full h-[140px] rounded-[8px] overflow-hidden">
        <Image
          preview={false}
          src={cover}
          className="w-full h-full"
          imgCls="w-full h-full object-cover object-center"
          placeholder={<IconCozImage className="w-[32px] h-[32px]" />}
        />
      </div>

      <div className="mt-[8px] px-[4px] grow flex flex-col">
        <div className="flex items-center gap-[8px] overflow-hidden">
          <Typography.Text
            className="!font-medium text-[16px] leading-[22px] coz-fg-primary !max-w-[180px]"
            ellipsis={{ showTooltip: true, rows: 1 }}
          >
            {name ?? I18n.t('project_release_template_info_name')}
          </Typography.Text>
        </div>

        <AvatarName
          className="mt-[4px]"
          avatar={userInfo?.avatar_url}
          name={userInfo?.name}
          username={userInfo?.user_name}
          label={userLabel}
        />

        <div className="mt-[8px] flex flex-col justify-between grow">
          <Typography.Text
            className="min-h-[44px] leading-[20px] coz-fg-secondary"
            ellipsis={{ showTooltip: true, rows: 2 }}
          >
            {description ?? I18n.t('project_release_template_info_desc')}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
