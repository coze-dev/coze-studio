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

import { I18n } from '@coze-arch/i18n';
import { Space, Tag } from '@coze-arch/coze-design';
import {
  ChunkType,
  DocumentSource,
  FormatType,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';

import { getSourceName } from '@/utils';
import { DOCUMENT_UPDATE_TYPE_MAP } from '@/constant';

import styles from '../styles/index.module.less';

export interface DocTagProps {
  documentInfo?: DocumentInfo;
}

export const DocTag: React.FC<DocTagProps> = ({ documentInfo }) => {
  const updateFrequencyStr = useMemo(() => {
    let str: string = DOCUMENT_UPDATE_TYPE_MAP[documentInfo?.update_type ?? ''];
    if (documentInfo?.update_interval) {
      str = `${I18n.t('datasets_segment_tag_updateFrequency', {
        num: documentInfo.update_interval,
      })}`;
    }
    return str;
  }, [documentInfo]);

  if (!documentInfo) {
    return null;
  }

  const renderSegmentTag = () => {
    const { format_type, chunk_strategy } = documentInfo;
    if (format_type !== FormatType.Text || !chunk_strategy) {
      return null;
    }
    if (chunk_strategy.chunk_type === ChunkType.CustomChunk) {
      return (
        <Tag color="primary" size="mini">
          {I18n.t('datasets_segment_tag_custom')}
        </Tag>
      );
    }
    if (chunk_strategy.chunk_type === ChunkType.LevelChunk) {
      return (
        <Tag color="primary" size="mini">
          {I18n.t('knowledge_level_016')}
        </Tag>
      );
    }
    return (
      <Tag color="primary" size="mini">
        {I18n.t('datasets_segment_tag_auto')}
      </Tag>
    );
  };

  return (
    <Space className={styles['doc-tag-wrapper']} spacing={4}>
      <Tag color="primary" size="mini">
        {getSourceName(documentInfo)}
      </Tag>
      {documentInfo.source_type === DocumentSource.Web && (
        <Tag color="primary" size="mini">
          {updateFrequencyStr}
        </Tag>
      )}
      {renderSegmentTag()}
    </Space>
  );
};
