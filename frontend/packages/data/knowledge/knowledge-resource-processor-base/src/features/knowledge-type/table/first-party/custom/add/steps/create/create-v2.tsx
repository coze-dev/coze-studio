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

import React, { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import {
  FooterBtnStatus,
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { DocumentSource, FormatType } from '@coze-arch/bot-api/knowledge';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { type AddCustomTableMeta } from '@/types';
import { useCreateDocumentReq } from '@/services';
import { getCustomStatus } from '@/features/knowledge-type/table/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import { MAX_TABLE_META_COLUMN_LEN } from '@/constants';
import { TableStructure, TableStructureTitle } from '@/components';

import styles from './create-v2.module.less';

function getCreateDocumentParams(
  metaData: AddCustomTableMeta & { key?: string; id?: string },
  isAppend: boolean,
) {
  return {
    document_bases: [
      {
        name: '', // Table custom control
        source_info: {
          document_source: DocumentSource.Custom,
        },
        table_meta: metaData.map((meta, index) => ({
          column_name: meta.column_name,
          is_semantic: meta.is_semantic,
          column_type: meta.column_type,
          desc: meta.desc,
          sequence: index.toString(),
        })),
      },
    ],
    format_type: FormatType.Table,
    is_append: isAppend,
  };
}
export const TableCustomCreate = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { footer, useStore } = props;
  const params = useKnowledgeParams();

  const resourceNavigate = useDataNavigate();

  const { datasetID: knowledgeId } = params;
  const [footerStatus, setFooterStatus] = useState(FooterBtnStatus.ENABLE);
  const currentUuid = nanoid();
  const [metaData, setMetaData] = useState<AddCustomTableMeta>([
    {
      id: currentUuid,
      key: currentUuid,
      column_name: '',
      is_semantic: false,
    },
  ]);
  const documentList = useStore(state => state.documentList) ?? [];
  const isAppend = documentList.length !== 0;

  const createDocument = useCreateDocumentReq({
    onSuccess: () => {
      setFooterStatus(FooterBtnStatus.ENABLE);
      resourceNavigate.toResource?.('knowledge', knowledgeId);
    },
    onFail: () => {
      setFooterStatus(FooterBtnStatus.DISABLE);
    },
  });

  useEffect(() => {
    if (footerStatus !== FooterBtnStatus.LOADING) {
      setFooterStatus(getCustomStatus(metaData, 'toBeDelete')); // toBeDelete to be deleted
    }
  }, [metaData]);

  const TooltipWrapper = ({ children }: { children: JSX.Element }) => {
    if (metaData.length >= MAX_TABLE_META_COLUMN_LEN) {
      return (
        <Tooltip trigger="hover" content={I18n.t('knowledge_1222_01')}>
          {children}
        </Tooltip>
      );
    }
    return <>{children}</>;
  };
  return (
    <div className={styles['create-table-wrapper']}>
      <TableStructureTitle />
      <TableStructure
        initValid
        isDragTable
        data={metaData}
        setData={setMetaData as (v: Array<DocTableColumn>) => void}
      />
      <TooltipWrapper>
        <Button
          data-testid={KnowledgeE2e.TableCustomUAddFieldBtn}
          className={styles['add-column-button']}
          type="tertiary"
          disabled={metaData.length >= MAX_TABLE_META_COLUMN_LEN}
          onClick={() => {
            const curUuid = nanoid();
            setMetaData(
              metaData.concat({
                id: curUuid,
                key: curUuid,
                column_name: '',
                is_semantic: false,
              }),
            );
          }}
          block={false}
          icon={<IconCozPlus />}
        >
          {I18n.t('datasets_segment_tableStructure_add_field')}
        </Button>
      </TooltipWrapper>
      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.CreateUnitConfirmBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('variable_reset_yes'),
              onClick: () => {
                setFooterStatus(FooterBtnStatus.LOADING);
                createDocument(getCreateDocumentParams(metaData, isAppend));
              },
              status: footerStatus,
            },
          ])
        : null}
    </div>
  );
};
