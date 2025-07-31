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

/* eslint-disable complexity */
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import { type DropDownMenuItemItem } from '@coze-arch/bot-semi/Dropdown';
import { FormatType, type DocumentInfo } from '@coze-arch/bot-api/knowledge';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';

import { type ActionType } from '@/types';

import { getBasicConfig, getResegmentType } from './preview';

export const getUnitType = (doc: DocumentInfo) => {
  if (doc.format_type === FormatType.Text) {
    if (doc.source_type === DocumentSource.Document) {
      return UnitType.TEXT_DOC;
    }
    if (doc.source_type === DocumentSource.Web) {
      return UnitType.TEXT_URL;
    }
    if (doc.source_type === DocumentSource.Custom) {
      return UnitType.TEXT_CUSTOM;
    }
    if (doc.source_type === DocumentSource.FrontCrawl) {
      return UnitType.TEXT_EXTENSION;
    }
    if (doc.source_type === DocumentSource.Notion) {
      return UnitType.TEXT_NOTION;
    }
    if (doc.source_type === DocumentSource.GoogleDrive) {
      return UnitType.TEXT_GOOGLE_DRIVE;
    }
    if (doc.source_type === DocumentSource.FeishuWeb) {
      return UnitType.TEXT_FEISHU;
    }
    if (doc.source_type === DocumentSource.LarkWeb) {
      return UnitType.TEXT_LARK;
    }
    if (doc.source_type === DocumentSource.WeChat) {
      return UnitType.TEXT_WECHAT;
    }
  }
  if (doc.format_type === FormatType.Table) {
    if (doc.source_type === DocumentSource.Document) {
      return UnitType.TABLE_DOC;
    }
    if (doc.source_type === DocumentSource.Web) {
      return UnitType.TABLE_API;
    }
    if (doc.source_type === DocumentSource.Custom) {
      return UnitType.TABLE_CUSTOM;
    }
    if (doc.source_type === DocumentSource.GoogleDrive) {
      return UnitType.TABLE_GOOGLE_DRIVE;
    }
    if (doc.source_type === DocumentSource.FeishuWeb) {
      return UnitType.TABLE_FEISHU;
    }
    if (doc.source_type === DocumentSource.LarkWeb) {
      return UnitType.TABLE_LARK;
    }
  }
  return UnitType.TEXT_URL;
};
export const DOCUMENT_SOURCE_TYPE_MAP: Record<DocumentSource, string> = {
  [DocumentSource.Document]: I18n.t('dataset_detail_source_local'),
  [DocumentSource.Web]: I18n.t('dataset_detail_source_online'),
  [DocumentSource.Custom]: I18n.t('dataset_detail_source_custom'),
  [DocumentSource.ThirdParty]: '', // Todo three-way, the backend idl has this type, but no i18n.
  [DocumentSource.FrontCrawl]: I18n.t('dataset_detail_source_online'),
  [DocumentSource.GoogleDrive]: I18n.t('knowledge-3rd-party-google-drive'),
  [DocumentSource.Notion]: I18n.t('knowledge-3rd-party-notion'),
  [DocumentSource.FeishuWeb]: I18n.t('knowledge-3rd-party-feishu'),
  [DocumentSource.LarkWeb]: I18n.t('Lark_00001'),
  [DocumentSource.OpenApi]: I18n.t('dataset_detail_source_custom'),
  [DocumentSource.WeChat]: I18n.t('knowledge_weixin_001'),
};

/**
 * Get source name
 */
export const getSourceName = (docInfo: DocumentInfo) => {
  const { format_type: formatType, source_type: sourceType } = docInfo || {};
  if (formatType === FormatType.Table && sourceType === DocumentSource.Web) {
    return 'Api';
    // If it is a third-party data source
  }
  return DOCUMENT_SOURCE_TYPE_MAP[sourceType || 0] || '-';
};

export const getFormatTypeFromUnitType = (type: UnitType) => {
  switch (type) {
    case UnitType.TABLE:
    case UnitType.TABLE_API:
    case UnitType.TABLE_DOC:
    case UnitType.TABLE_CUSTOM:
    case UnitType.TABLE_FEISHU:
    case UnitType.TABLE_GOOGLE_DRIVE:
      return FormatType.Table;
    case UnitType.IMAGE:
      return FormatType.Image;
    default:
      return FormatType.Text;
  }
};

interface JumpToResegmentUrlParams {
  spaceID: string;
  datasetID: string;
  formatType: FormatType;
  docID?: string;
  sourceType?: DocumentSource;
}
interface JumpToAddDocParams {
  spaceID: string;
  datasetID: string;
  formatType: FormatType;
  docID?: string;
  type?: UnitType;
  /** The function is to bring the Douyin mark in the url when jumping to the upload page to distinguish the views on the upload page */
  isDouyinBot?: boolean;
}

export const jumpToResegmentUrl = (
  params: JumpToResegmentUrlParams,
  jump: (url: string) => void,
) => {
  jump(
    `/space/${params.spaceID}/knowledge/${
      params.datasetID
    }/upload?type=${getResegmentType(
      params?.formatType,
      params?.sourceType,
    )}&opt=${OptType.RESEGMENT}${
      params?.docID ? `&doc_id=${params?.docID}` : ''
    }`,
  );
};

export const getAddContentUrl = ({
  spaceID,
  datasetID,
  type,
  docID,
  formatType,
  pageMode,
  botId,
  actionType,
  isDouyinBot,
}: JumpToAddDocParams & {
  pageMode?: string;
  botId?: string;
  actionType?: ActionType;
}) => {
  const baseUrl = `/space/${spaceID}/knowledge/${datasetID}/upload`;

  const queryParams: Record<string, string> = { type: type ?? '' };

  if (formatType === FormatType.Table && docID) {
    queryParams.opt = OptType.INCREMENTAL;
    queryParams.doc_id = docID;
  }

  if (pageMode) {
    queryParams.page_mode = pageMode;
  }

  if (botId) {
    queryParams.bot_id = botId;
  }

  if (actionType) {
    queryParams.action_type = actionType;
  }

  if (isDouyinBot) {
    queryParams.is_douyin = 'true';
  }

  const params = new URLSearchParams(queryParams);

  return `${baseUrl}?${params.toString()}`;
};

export const jumpToAddDocUrl = (
  params: JumpToAddDocParams,
  jump: (url: string) => void,
) => {
  jump(getAddContentUrl(params));
};

export const getAddContentMenu = ({
  documentList,
  formatType,
  publicConfig,
  isGoogleEnabled,
  isFeishuEnabled,
  isNotionEnabled,
  isLarkEnabled,
  isWechatEnabled,
}: {
  documentList: DocumentInfo[];
  formatType: FormatType;
  publicConfig: Omit<Partial<DropDownMenuItemItem>, 'onClick'> & {
    onClick: (unitType: UnitType) => void;
  };
  isGoogleEnabled: boolean;
  isNotionEnabled: boolean;
  isFeishuEnabled: boolean;
  isLarkEnabled: boolean;
  isWechatEnabled: boolean;
}): (DropDownMenuItemItem & {
  unitType: UnitType;
})[] => {
  const { onClick } = publicConfig;
  const basicConfig = getBasicConfig();
  let validOptions = [];
  switch (formatType) {
    case FormatType.Image: {
      // @ts-expect-error -- linter-disable-autofix
      validOptions = [UnitType.IMAGE_FILE];
      break;
    }
    case FormatType.Table: {
      if (documentList?.length > 0) {
        validOptions = [
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_DOC,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_API,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_CUSTOM,
        ];
      } else {
        validOptions = [
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_DOC,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_API,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_FEISHU,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_LARK,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_GOOGLE_DRIVE,
          // @ts-expect-error -- linter-disable-autofix
          UnitType.TABLE_CUSTOM,
        ];
      }

      break;
    }
    default:
      validOptions = [
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_DOC,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_URL,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_FEISHU,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_WECHAT,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_NOTION,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_LARK,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_GOOGLE_DRIVE,
        // @ts-expect-error -- linter-disable-autofix
        UnitType.TEXT_CUSTOM,
      ];
  }
  return validOptions
    .filter(value => {
      if (
        value === UnitType.TABLE_GOOGLE_DRIVE ||
        value === UnitType.TEXT_GOOGLE_DRIVE
      ) {
        return isGoogleEnabled;
      }
      if (value === UnitType.TEXT_NOTION) {
        return isNotionEnabled;
      }
      if (value === UnitType.TEXT_FEISHU || value === UnitType.TABLE_FEISHU) {
        return isFeishuEnabled;
      }
      if (value === UnitType.TEXT_LARK || value === UnitType.TABLE_LARK) {
        return isLarkEnabled;
      }
      if (value === UnitType.TEXT_WECHAT) {
        return isWechatEnabled;
      }
      return true;
    })
    .map(item => ({
      // @ts-expect-error -- linter-disable-autofix
      'data-dtestid': `${KnowledgeE2e.SegmentDetailDropdownItem}.${basicConfig[item].name}`,
      node: 'item',
      // @ts-expect-error -- linter-disable-autofix
      ...basicConfig[item],
      ...publicConfig,
      // @ts-expect-error -- linter-disable-autofix
      onClick: () => onClick(basicConfig[item]?.unitType),
    })) as unknown as (DropDownMenuItemItem & {
    unitType: UnitType;
  })[];
};
