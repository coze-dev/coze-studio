import { nanoid } from 'nanoid';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { type DocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/base';
import { type LevelDocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import {
  DocumentStatus,
  type DocumentInfo,
  type SliceInfo,
} from '@coze-arch/bot-api/knowledge';

import { getBasicConfig } from '@/utils/preview';
import { getUnitType } from '@/utils';
import { type ProgressMap } from '@/types';

const FINISH_PROGRESS = 100;

/**
 * 创建基础文档块
 */
export const createBaseDocumentChunkBySliceInfo = (
  props: SliceInfo,
): DocumentChunk => ({
  text_knowledge_editor_chunk_uuid: nanoid(),
  ...props,
});

/**
 * 创建层级文档块
 */
export const createLevelDocumentChunkByLevelSegment = (
  props: ILevelSegment,
): LevelDocumentChunk => ({
  text_knowledge_editor_chunk_uuid: nanoid(),
  sequence: props.slice_sequence?.toString(),
  content: props.text,
  ...props,
});

/**
 * 获取文档选项
 */
export const getDocumentOptions = (
  documentList: DocumentInfo[],
  progressMap: ProgressMap = {},
): OptionProps[] => {
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
