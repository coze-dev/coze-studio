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

import { useMemo } from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { formatBytes } from '@coze-arch/bot-utils';
import {
  FormatType,
  type Dataset,
  type DocumentInfo,
  DocumentSource,
  DocumentStatus,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';
import { Space, Tag } from '@coze-arch/coze-design';

import { type ProgressMap } from '@/types';
import { DOCUMENT_UPDATE_TYPE_MAP } from '@/constant';

import { getSourceName } from '../../utils';

export interface HeaderTagProps {
  dataSetDetail: Dataset;
  docInfo?: DocumentInfo;
  progressMap?: ProgressMap;
}
// eslint-disable-next-line complexity
export const HeaderTags = ({
  dataSetDetail,
  docInfo,
  progressMap = {},
}: HeaderTagProps) => {
  const formatType = dataSetDetail?.format_type;
  const updateFrequencyStr = useMemo(() => {
    if (!docInfo) {
      return '';
    }
    // @ts-expect-error -- linter-disable-autofix
    let str: string = DOCUMENT_UPDATE_TYPE_MAP[docInfo?.update_type];
    if (docInfo.update_interval) {
      str = `${I18n.t('datasets_segment_tag_updateFrequency', {
        num: docInfo.update_interval,
      })}`;
    }
    return str;
  }, [docInfo]);
  return (
    <div className="flex pb-[4px]" data-testid={KnowledgeE2e.UnitDetailTags}>
      <Space spacing={4} className="[&_.semi-tag-content]:font-medium">
        {/* file size */}
        {dataSetDetail?.all_file_size ? (
          <Tag size="mini" color="primary">
            {formatBytes(parseInt(String(dataSetDetail.all_file_size)))}
          </Tag>
        ) : null}

        {/* table source type  */}
        {formatType === FormatType.Table && !!docInfo && (
          <Tag size="mini" color="primary">
            {getSourceName(docInfo)}
          </Tag>
        )}

        {/* table api update type  */}
        {formatType === FormatType.Table &&
        docInfo &&
        docInfo?.source_type === DocumentSource.Web ? (
          <Tag size="mini" color="primary">
            {updateFrequencyStr}
          </Tag>
        ) : null}

        {/* doc count */}
        {formatType === FormatType.Text && !!dataSetDetail?.doc_count && (
          <Tag size="mini" color="primary">
            {I18n.t('kl2_009', {
              num: dataSetDetail?.doc_count ?? 0,
            })}
          </Tag>
        )}

        {/* Image source */}
        {formatType === FormatType.Image && (
          <Tag size="mini" color="primary">
            {I18n.t('dataset_detail_source_local')}
          </Tag>
        )}

        {/* number of pictures */}
        {formatType === FormatType.Image && !!dataSetDetail?.doc_count && (
          <Tag size="mini" color="primary">
            {I18n.t('knowledge_photo_015', {
              num: dataSetDetail?.doc_count || 0,
            })}
          </Tag>
        )}

        {/*  Do not display when no document is added */}
        {formatType !== FormatType.Image && !!dataSetDetail?.doc_count && (
          <>
            {/* slice count  */}
            <Tag size="mini" color="primary">
              {I18n.t('datasets_segment_tag_segments', {
                num: dataSetDetail?.slice_count ?? 0,
              })}
            </Tag>
            {/* hit count  */}
            <Tag size="mini" color="primary">
              {I18n.t('datasets_segment_card_hit', {
                num: dataSetDetail?.hit_count,
              })}
            </Tag>
          </>
        )}

        {dataSetDetail?.storage_location === StorageLocation.OpenSearch ? (
          <Tag size="mini" color="cyan">
            {I18n.t('knowledge_es_001')}
          </Tag>
        ) : null}

        {/* loading */}
        {Boolean(dataSetDetail?.processing_file_id_list) &&
          Boolean(dataSetDetail?.processing_file_id_list?.length) && (
            <Tag
              size="mini"
              color="blue"
              data-testid={KnowledgeE2e.UnitDetailTagsProcessing}
            >
              {I18n.t('datasets_segment_tag_processing')}
              {docInfo?.format_type === FormatType.Table &&
              // @ts-expect-error -- linter-disable-autofix
              progressMap?.[docInfo?.document_id]
                ? // @ts-expect-error -- linter-disable-autofix
                  `${progressMap?.[docInfo?.document_id]?.progress}%`
                : ''}
            </Tag>
          )}

        {/** Table error  */}
        {formatType === FormatType.Table &&
          docInfo?.status === DocumentStatus.Failed && (
            <Tag
              size="mini"
              color="red"
              data-testid={KnowledgeE2e.UnitDetailTagsFailed}
            >
              {docInfo?.status_descript || I18n.t('dataset_process_fail')}
            </Tag>
          )}
      </Space>
    </div>
  );
};
