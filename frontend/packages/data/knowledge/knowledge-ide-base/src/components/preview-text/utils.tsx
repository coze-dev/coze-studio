/* eslint-disable complexity */
import { I18n } from '@coze-arch/i18n';
import {
  DocumentStatus,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze/coze-design';

import { getUnitType } from '@/utils';
import { type ProgressMap } from '@/types';
import { getBasicConfig } from '@/utils/preview';

import styles from './index.module.less';

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
        <div className={styles['doc-option']} key={doc?.document_id}>
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
