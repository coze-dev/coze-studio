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
import { I18n } from '@coze-arch/i18n';
import {
  DocumentStatus,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze-arch/coze-design';

import { getBasicConfig } from '@/utils/preview';
import { getUnitType } from '@/utils';
import { type ProgressMap } from '@/types';

const FINISH_PROGRESS = 100;
export const getDocumentOptions = (
  documentList: DocumentInfo[],
  progressMap: ProgressMap = {},
) => {
  const basicConfig = getBasicConfig();
  return documentList.map(doc => {
    const unitType = getUnitType({
      format_type: doc?.format_type,
      source_type: doc?.source_type,
    });
    const config = basicConfig[unitType];

    return {
      value: doc.document_id,
      text: doc.name,
      label: (
        <div
          className="flex flex-row items-center justify-center max-w-[603px] coz-fg-primary"
          key={doc?.document_id}
        >
          <div className="flex text-[16px]">{config?.icon}</div>
          <Typography.Text
            ellipsis={{ showTooltip: { opts: { theme: 'dark' } } }}
            fontSize="14px"
            className="w-full grow truncate ml-[8px]"
          >
            {doc.name}
          </Typography.Text>

          <div className="flex items-center shrink-0 ml-[4px]">
            {Object.keys(progressMap).includes(doc?.document_id ?? '') &&
            progressMap?.[doc?.document_id ?? '']?.progress <
              FINISH_PROGRESS ? (
              <Tag color="blue" size="mini" className="font-medium">
                {I18n.t('datasets_segment_tag_processing')}
                {` ${progressMap[doc?.document_id ?? '']?.progress}%`}
              </Tag>
            ) : null}
            {doc?.status === DocumentStatus.Failed ? (
              <Tooltip theme="dark" content={doc?.status_descript}>
                <IconCozInfoCircle className="coz-fg-hglt-red" />
              </Tooltip>
            ) : null}
          </div>
        </div>
      ),
    };
  });
};
