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

/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable complexity */
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

import classNames from 'classnames';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { useEditKnowledgeModal } from '@coze-data/knowledge-modal-adapter';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { useFlags } from '@coze-arch/bot-flags';
import { FormatType, type Dataset } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import {
  IconCozArrowLeft,
  IconCozEdit,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import {
  Space,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

import { getUnitType } from '@/utils';
import { type ProgressMap } from '@/types';
import { RenderDocumentIcon } from '@/components/render-document-icon';
import { PhotoFilter } from '@/components/photo-filter';
import { HeaderTags, RelatedBotsList } from '@/components';

import styles from './index.module.less';

export interface KnowledgeIDENavBarProps {
  progressMap: ProgressMap;
  hideBackButton?: boolean;
  textConfigButton?: React.ReactNode;
  tableConfigButton?: React.ReactNode;
  importKnowledgeSourceButton?: React.ReactNode;
  onChangeDataset: (dataset: Dataset) => void;
  onBack?: () => void;
}

export const KnowledgeIDENavBar = ({
  onChangeDataset,
  progressMap,
  hideBackButton,
  textConfigButton,
  tableConfigButton,
  importKnowledgeSourceButton,
  onBack,
}: KnowledgeIDENavBarProps) => {
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const documentList = useKnowledgeStore(state => state.documentList);
  const navigate = useNavigate();
  const params = useKnowledgeParams();

  const [FLAGS] = useFlags();

  const { node: editKnowledgeModal, edit } = useEditKnowledgeModal({
    onOk: async formValue => {
      await KnowledgeApi.UpdateDataset({
        dataset_id: formValue.id,
        name: formValue.name,
        icon_uri: formValue.icon_uri?.[0].uid,
        description: formValue.description,
      });
      onChangeDataset({
        ...dataSetDetail,
        name: formValue?.name || dataSetDetail?.name,
        description: formValue?.description || dataSetDetail?.description,
        icon_uri: formValue.icon_uri?.at(0)?.uid || dataSetDetail?.icon_uri,
        icon_url: formValue.icon_uri?.at(0)?.url || dataSetDetail?.icon_url,
      });
    },
  });

  const isTableFormat = dataSetDetail?.format_type === FormatType.Table;
  const isImageFormat = dataSetDetail?.format_type === FormatType.Image;
  const isShowResegmentBtn =
    canEdit &&
    !isTableFormat &&
    !!dataSetDetail?.doc_count &&
    !dataSetDetail?.processing_file_id_list?.length &&
    !isImageFormat;

  const documentInfo = documentList?.[0];
  const unitType = useMemo(() => {
    if (documentInfo) {
      return getUnitType({
        format_type: FormatType.Table,
        source_type: documentInfo?.source_type,
      });
    }
    return UnitType.TABLE_API;
  }, [documentInfo]);
  const isShowLinkUrl = useMemo(
    () =>
      unitType &&
      [
        UnitType.TABLE_API,
        UnitType.TABLE_GOOGLE_DRIVE,
        UnitType.TABLE_FEISHU,
        UnitType.TABLE_LARK,
      ].includes(unitType),
    [unitType],
  );
  // Link or action will only be displayed when one exists
  const showTableConfigButton =
    (isShowLinkUrl || canEdit) && isTableFormat && documentList?.length;

  const handleBack = () => {
    onBack?.();
    navigate(`/space/${params.spaceID}/library`);
  };

  const fromProject = params.biz === 'project';

  return (
    <div
      className={classNames(
        'flex items-center justify-between shrink-0',
        fromProject ? 'px-[16px] py-[12px]' : 'h-[56px]',
        styles.brief,
      )}
    >
      <div className={styles.info}>
        {hideBackButton ? null : (
          <IconButton
            color="secondary"
            icon={<IconCozArrowLeft className="text-[16px]" />}
            iconPosition="left"
            onClick={handleBack}
            className="mr-[4px]"
          ></IconButton>
        )}
        {/* icon */}
        <div className={styles.icon}>
          {dataSetDetail?.icon_url ? (
            <Avatar
              src={dataSetDetail?.icon_url}
              shape="square"
              size="default"
            />
          ) : (
            <RenderDocumentIcon
              formatType={dataSetDetail?.format_type || FormatType.Text}
              className={styles['doc-icon-note']}
              iconSuffixClassName="icon-with-suffix-overlay"
            />
          )}
        </div>
        <div className={styles.content}>
          <div className="flex items-center gap-[3px]">
            <Typography.Text
              data-testid={KnowledgeE2e.SegmentDetailTitle}
              className={styles.title}
              weight={500}
              ellipsis={{
                showTooltip: {
                  opts: { content: dataSetDetail?.name },
                },
              }}
            >
              {dataSetDetail?.name}
            </Typography.Text>
            {canEdit ? (
              <Tooltip content={I18n.t('datasets_segment_edit')}>
                <IconButton
                  data-testid={KnowledgeE2e.SegmentDetailTitleEditIcon}
                  size="mini"
                  color="secondary"
                  icon={<IconCozEdit className="text-[14px]" />}
                  iconPosition="left"
                  wrapperClass="text-[0] leading-none"
                  className="coz-fg-secondary"
                  onClick={() => {
                    edit({
                      id: dataSetDetail.dataset_id || '',
                      name: dataSetDetail?.name,
                      description: dataSetDetail?.description,
                      icon_uri: [
                        {
                          url: dataSetDetail?.icon_url || '',
                          uid: dataSetDetail?.icon_uri || '',
                        },
                      ],
                    });
                  }}
                />
              </Tooltip>
            ) : null}
            {FLAGS['bot.data.knowledge_bots_count'] ? (
              <div className={styles['bot-count']}>
                <div className={styles['bot-count-text']}>
                  {I18n.t('knowledge_optimize_019', {
                    n: dataSetDetail?.bot_used_count ?? 0,
                  })}
                </div>
                {!!dataSetDetail?.bot_used_count && (
                  <Tooltip
                    autoAdjustOverflow={true}
                    position={
                      dataSetDetail?.bot_used_count > 2 ? 'bottom' : 'top'
                    }
                    content={
                      <RelatedBotsList
                        datasetId={dataSetDetail?.dataset_id ?? ''}
                        classNameItem={styles['bot-used-count']}
                      />
                    }
                  >
                    <IconCozInfoCircle className={styles['bot-count-icon']} />
                  </Tooltip>
                )}
              </div>
            ) : null}
          </div>
          <HeaderTags
            dataSetDetail={dataSetDetail}
            docInfo={documentList?.[0]}
            progressMap={progressMap}
          />
        </div>
      </div>
      <div>
        <Space spacing={10}>
          {isImageFormat ? <PhotoFilter /> : null}
          {isShowResegmentBtn ? textConfigButton : null}
          {showTableConfigButton ? tableConfigButton : null}
          {canEdit ? importKnowledgeSourceButton : null}
        </Space>
      </div>
      {editKnowledgeModal}
    </div>
  );
};
