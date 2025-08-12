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

import { I18n } from '@coze-arch/i18n';
import { Avatar, Tag } from '@coze-arch/coze-design';
import { type Model } from '@coze-arch/bot-api/developer_api';

/** Minimalist ModelOption for Button Display or Select Selected Bar */
export function ModelOptionThumb({ model }: { model: Model }) {
  return (
    <div className="px-[4px] flex items-center gap-[4px]">
      <Avatar
        shape="square"
        size="extra-extra-small"
        src={model.model_icon}
        className="rounded-[4px] border border-solid coz-stroke-primary"
      />
      <span className="text-[14px] leading-[20px] coz-fg-primary">
        {model.name}
      </span>
      {model.model_status_details?.is_upcoming_deprecated ? (
        <Tag size="mini" color="yellow">
          {I18n.t('model_list_willDeprecated')}
        </Tag>
      ) : null}
    </div>
  );
}
