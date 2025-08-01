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

import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozDicumentOnline,
  IconCozDocument,
  IconCozGoogleDriveFill,
  IconCozLarkFill,
  IconCozNotionFill,
  IconCozPencilPaper,
  IconCozPlug,
  IconCozWechatFill,
} from '@coze-arch/coze-design/icons';
import { FormatType, type DocumentSource } from '@coze-arch/bot-api/knowledge';

export function isNoMore(data, pageSize) {
  return Boolean(
    !data?.total || (data.nextPageIndex - 1) * pageSize >= data.total,
  );
}

export function isStop(res) {
  return res?.list?.length || res?.total;
}

export const getResegmentType = (
  formatType: FormatType,
  sourceType?: DocumentSource,
) => {
  switch (formatType) {
    case FormatType.Table: {
      return 'table';
    }
    default:
      return 'text';
  }
};
export const getBasicConfig = () => ({
  [UnitType.IMAGE_FILE]: {
    unitType: UnitType.IMAGE_FILE,
    name: I18n.t('knowledge_photo_002'),
    icon: <IconCozDocument className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_DOC]: {
    unitType: UnitType.TABLE_DOC,
    name: I18n.t('datasets_createFileModel_step1_TabLocalTitle'),
    icon: <IconCozDocument className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_API]: {
    unitType: UnitType.TABLE_API,
    name: I18n.t('datasets_createFileModel_step1_apiTitle'),
    icon: <IconCozPlug className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_CUSTOM]: {
    unitType: UnitType.TABLE_CUSTOM,
    name: I18n.t('dataset_detail_source_custom'),
    icon: <IconCozPencilPaper className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_FEISHU]: {
    unitType: UnitType.TABLE_FEISHU,
    name: I18n.t('knowledge-3rd-party-feishu'),
    icon: <IconCozLarkFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_LARK]: {
    unitType: UnitType.TABLE_LARK,
    name: I18n.t('Lark_00001'),
    icon: <IconCozLarkFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TABLE_GOOGLE_DRIVE]: {
    unitType: UnitType.TABLE_GOOGLE_DRIVE,
    name: I18n.t('knowledge-3rd-party-google-drive'),
    icon: <IconCozGoogleDriveFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_DOC]: {
    unitType: UnitType.TEXT_DOC,
    name: I18n.t('datasets_createFileModel_step1_TabLocalTitle'),
    icon: <IconCozDocument className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_URL]: {
    unitType: UnitType.TEXT_URL,
    name: I18n.t('datasets_createFileModel_step1_urlTitle'),
    icon: <IconCozDicumentOnline className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_EXTENSION]: {
    unitType: UnitType.TEXT_EXTENSION,
    name: I18n.t('datasets_createFileModel_step1_urlTitle'),
    icon: <IconCozDicumentOnline className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_NOTION]: {
    unitType: UnitType.TEXT_NOTION,
    name: I18n.t('knowledge-3rd-party-notion'),
    icon: <IconCozNotionFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_FEISHU]: {
    unitType: UnitType.TEXT_FEISHU,
    node: 'item',
    name: I18n.t('knowledge-3rd-party-feishu'),
    icon: <IconCozLarkFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_LARK]: {
    unitType: UnitType.TEXT_LARK,
    name: I18n.t('Lark_00001'),
    icon: <IconCozLarkFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_GOOGLE_DRIVE]: {
    unitType: UnitType.TEXT_GOOGLE_DRIVE,
    name: I18n.t('knowledge-3rd-party-google-drive'),
    icon: <IconCozGoogleDriveFill className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_CUSTOM]: {
    unitType: UnitType.TEXT_CUSTOM,
    name: I18n.t('dataset_detail_source_custom'),
    icon: <IconCozPencilPaper className="w-4 h-4 [&>path]:fill-current" />,
  },
  [UnitType.TEXT_WECHAT]: {
    unitType: UnitType.TEXT_WECHAT,
    // @ts-expect-error -- no translation yet TODO: hzf
    name: I18n.t('公众号'),
    icon: <IconCozWechatFill className="w-4 h-4 [&>path]:fill-current" />,
  },
});

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/<(?!(img|table|tr|td|th)\b[^>]*>|\/(?:table|tr|td|th)>)/g, '&lt;')
    .replace(/\n/g, '<br />');
}
