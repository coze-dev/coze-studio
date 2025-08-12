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

import { AuthStatus } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { ConnectorPublicType } from '@coze-arch/bot-api/connector_api';

export enum EStatus {
  'NOT_CONF' = '3',
  'CONF' = '4',
}

const statusRenderMap = {
  [`publicType_${ConnectorPublicType.Private}`]: {
    label: I18n.t('coze_custom_publish_platform_12'),
    bg: 'bg-[var(--coz-mg-color-magenta)]',
    color: 'text-[var(--coz-fg-color-magenta)]',
  },
  [`publicType_${ConnectorPublicType.Public}`]: {
    label: I18n.t('coze_custom_publish_platform_13'),
    bg: 'bg-[var(--coz-mg-color-cyan)]',
    color: 'text-[var(--coz-fg-color-cyan)]',
  },
  [`config_${EStatus.NOT_CONF}`]: {
    label: I18n.t('coze_custom_publish_platform_14'),
    bg: 'bg-[var(--coz-mg-primary)]',
    color: 'text-[var(--coz-fg-primary)]',
  },
  [`config_${EStatus.CONF}`]: {
    label: I18n.t('coze_custom_publish_platform_15'),
    bg: 'bg-[var(--coz-mg-hglt-green)]',
    color: 'text-[var(--coz-fg-hglt-green)]',
  },
  [`auth_${AuthStatus.Authorized}`]: {
    label: I18n.t('bot_publish_columns_status_authorized'),
    bg: 'bg-[var(--coz-mg-hglt-plus-dim)]',
    color: 'text-[var(--coz-fg-hglt)]',
  },
  [`auth_${AuthStatus.Unauthorized}`]: {
    label: I18n.t('bot_publish_columns_status_unauthorized'),
    bg: 'bg-[var(--coz-mg-primary)]',
    color: 'text-[var(--coz-fg-primary)]',
  },
};

const TagWithStatus = ({
  prefix,
  status,
}: {
  status: EStatus | ConnectorPublicType | AuthStatus;
  prefix: 'auth' | 'config' | 'publicType';
}) => {
  const tag = statusRenderMap[`${prefix}_${status}`];

  return tag ? (
    <span
      className={`whitespace-nowrap inline-block px-[5px] py-[0] h-[16px] leading-[16px]
        rounded-[4px] text-[10px] ${tag.color} ${tag.bg}`}
    >
      {tag.label}
    </span>
  ) : null;
};

export { TagWithStatus };
