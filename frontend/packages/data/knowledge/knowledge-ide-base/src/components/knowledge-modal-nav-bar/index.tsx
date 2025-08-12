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

import React, { useEffect } from 'react';

import classNames from 'classnames';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import {
  FormatType,
  type Dataset,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton, Avatar, Space } from '@coze-arch/coze-design';

import { getFormatTypeFromUnitType } from '@/utils';
import { RenderDocumentIcon } from '@/components/render-document-icon';
import { PhotoFilter } from '@/components/photo-filter';
import { HeaderTags } from '@/components/header-tags';

import styles from './index.module.less';

export interface KnowledgeModalNavBarProps {
  title: string;
  datasetDetail?: Dataset;
  docInfo?: DocumentInfo;
  importKnowledgeSourceButton?: React.ReactNode;
  actionButtons?: React.ReactNode;
  onBack?: () => void;
  beforeBack?: () => void;
}

export const KnowledgeModalNavBar: React.FC<KnowledgeModalNavBarProps> = ({
  title,
  actionButtons,
  datasetDetail,
  docInfo,
  onBack,
  beforeBack,
  importKnowledgeSourceButton,
}) => {
  const setSearchValue = useKnowledgeStore(state => state.setSearchValue);
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const canEdit = useKnowledgeStore(state => state.canEdit);

  const params = useKnowledgeParams();

  useEffect(
    () => () => {
      setSearchValue('');
    },
    [],
  );

  const isImageFormat = dataSetDetail?.format_type === FormatType.Image;

  return (
    <div
      className={classNames(
        'flex items-center justify-between shrink-0 h-[56px]',
        styles.navbar,
      )}
      data-testid={KnowledgeE2e.KnowledgeAddContentNavBar}
    >
      <div className={styles.brief}>
        <IconButton
          color="secondary"
          icon={<IconCozCross className="text-[16px]" />}
          iconPosition="left"
          className={`${styles['back-icon']} mr-[8px]`}
          onClick={() => {
            beforeBack?.();
            onBack?.();
          }}
        ></IconButton>
        {datasetDetail?.icon_url ? (
          <Avatar src={datasetDetail?.icon_url} shape="square" />
        ) : (
          <RenderDocumentIcon
            formatType={getFormatTypeFromUnitType(params.type ?? UnitType.TEXT)}
            className={styles['doc-icon-note']}
            iconSuffixClassName="icon-with-suffix-overlay"
          />
        )}
        <div className="ml-[12px]">
          <p className="text-[18px] font-medium">{title}</p>
          {!!datasetDetail && (
            <HeaderTags dataSetDetail={datasetDetail} docInfo={docInfo} />
          )}
        </div>
      </div>

      <div className={styles.toolbar}>
        <Space spacing={12}>
          {isImageFormat ? <PhotoFilter /> : null}
          {/* import button */}
          {canEdit ? importKnowledgeSourceButton : null}
          {actionButtons}
        </Space>
      </div>
    </div>
  );
};
