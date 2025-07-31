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

import {
  KNOWLEDGE_MAX_DOC_SIZE,
  KNOWLEDGE_MAX_SLICE_COUNT,
} from '@coze-data/knowledge-modal-base';
import { I18n } from '@coze-arch/i18n';
import { type Dataset, type DocumentInfo } from '@coze-arch/bot-api/knowledge';
import { DocumentStatus, FormatType } from '@coze-arch/bot-api/knowledge';

/**
 * Disable hints for working with table-type datasets
 */
export const getTableFormatTooltip = (documentList: DocumentInfo[]): string => {
  const docInfo = documentList?.[0];
  if (!docInfo) {
    return '';
  }

  if (docInfo.status === DocumentStatus.Processing) {
    return I18n.t('knowledge_add_content_processing_tips');
  }

  // @ts-expect-error -- linter-disable-autofix
  if (docInfo?.slice_count >= KNOWLEDGE_MAX_SLICE_COUNT) {
    return I18n.t('kl2_002');
  }

  return '';
};

/**
 * Disable hints for handling default type datasets
 */
export const getDefaultFormatTooltip = (dataSetDetail: Dataset): string => {
  // @ts-expect-error -- linter-disable-autofix
  if (dataSetDetail?.doc_count >= KNOWLEDGE_MAX_DOC_SIZE) {
    return I18n.t('kl2_003');
  }

  if (dataSetDetail?.processing_file_id_list?.length) {
    return I18n.t('knowledge_add_content_processing_tips');
  }

  return '';
};

/**
 * Create prompt text when button is disabled
 * @param dataSetDetail - Dataset Details
 * @param documentList - Document List
 * @Returns prompt text
 */
export const createBtnDisableToolTip = (
  dataSetDetail: Dataset,
  documentList: DocumentInfo[],
): string => {
  const formatType = dataSetDetail?.format_type;

  const tooltipHandlers: Record<string, () => string> = {
    [FormatType.Table]: () => getTableFormatTooltip(documentList),
    default: () => getDefaultFormatTooltip(dataSetDetail),
  };

  if (!formatType) {
    return tooltipHandlers.default();
  }

  const handler = tooltipHandlers[formatType] || tooltipHandlers.default;
  return handler();
};
