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
import { useEffect } from 'react';

import { nanoid } from 'nanoid';
import { isEmpty } from 'lodash-es';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { UIEmpty } from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import { TableDataType } from '@coze-arch/bot-api/memory';
import { Button, Tooltip } from '@coze-arch/coze-design';

import { useOptFromQuery } from '@/utils';
import { type TableItem } from '@/types/table';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/index';
import {
  useResegmentFetchTableParams,
  isConfigurationLoading as isLoadingFunc,
  isConfigurationError as isErrorFunc,
  isConfigurationShowBanner as isShowBannerFunc,
  getConfigurationMeta,
  getConfigurationNextStatus,
  semanticValidator,
  useFetchTableSchemaInfo,
} from '@/features/knowledge-type/table/index';
import {
  TableStatus,
  TableSettingFormFields,
  MAX_TABLE_META_COLUMN_LEN,
} from '@/constants';
import {
  TableStructure as TableStructureInternal,
  ConfigurationLoading,
  ConfigurationError,
  ConfigurationBanner,
} from '@/components';

import { TableLocalResegmentStep } from '../../constants';

import styles from './index.module.less';

export const TableConfiguration = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;
  /** common action */
  const setCurrentStep = useStore(state => state.setCurrentStep);

  /** table store*/
  const status = useStore(state => state.status);
  const tableData = useStore(state => state.tableData);
  const originTableData = useStore(state => state.originTableData);
  const tableSettings = useStore(state => state.tableSettings);
  const semanticValidate = useStore(state => state.semanticValidate);
  /** table action*/
  const setTableData = useStore(state => state.setTableData);
  const setStatus = useStore(state => state.setStatus);
  const setSemanticValidate = useStore(state => state.setSemanticValidate);

  /** compute action */
  const opt = useOptFromQuery();
  const isLoading = isLoadingFunc(status);
  const isError = isErrorFunc(status);
  const isShowBanner = isShowBannerFunc(opt, tableData, tableSettings);
  const meta = getConfigurationMeta(tableData, tableSettings);

  /** network action */
  const fetchTableInfo = useFetchTableSchemaInfo<T>(useStore);

  const resegmentParams = useResegmentFetchTableParams();

  useEffect(() => {
    if (!tableData.table_meta) {
      setStatus(TableStatus.LOADING);
      fetchTableInfo(resegmentParams);
    }
  }, [tableData]);

  if (isLoading) {
    return <ConfigurationLoading />;
  }
  if (isError) {
    return (
      <ConfigurationError
        fetchTableInfo={() => {
          setStatus(TableStatus.LOADING);
          fetchTableInfo(resegmentParams);
        }}
      />
    );
  }

  const TooltipWrapper = ({ children }: { children: JSX.Element }) => {
    if (meta.length >= MAX_TABLE_META_COLUMN_LEN) {
      return (
        <Tooltip trigger="hover" content={I18n.t('knowledge_1222_01')}>
          {children}
        </Tooltip>
      );
    }
    return <>{children}</>;
  };

  const handleAddField = () => {
    const curUuid = nanoid();
    const curSheet = tableSettings[TableSettingFormFields.SHEET];
    const newData = {
      ...tableData,
      table_meta: {
        ...tableData.table_meta,
        [curSheet]: tableData?.table_meta?.[curSheet]?.concat({
          id: curUuid,
          key: curUuid,
          column_name: '',
          is_semantic: false,
          column_type: undefined,
          sequence: undefined,
          is_new_column: true,
        }),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTableData(newData as any);
  };

  return (
    <>
      <div className={styles['table-resegment']}>
        <TableStructureInternal
          tipsNode={
            <>
              {isShowBanner ? <ConfigurationBanner /> : null}
              {!meta.length || isEmpty(originTableData) ? (
                <UIEmpty
                  empty={{
                    title: I18n.t('knowledge_1221_02'),
                    icon: <IllustrationNoResult></IllustrationNoResult>,
                  }}
                />
              ) : null}
            </>
          }
          showTitle
          initValid
          isDragTable
          baseKey={`${tableSettings[TableSettingFormFields.SHEET]}.${
            tableSettings[TableSettingFormFields.KEY_START_ROW]
          }.`}
          data={meta}
          verifyMap={
            semanticValidate[tableSettings[TableSettingFormFields.SHEET]] || {}
          }
          setData={v => {
            const curSheet = tableSettings[TableSettingFormFields.SHEET];
            const newData = {
              ...tableData,
              table_meta: {
                ...tableData.table_meta,
                [curSheet]: (v || []).map((item, index) => ({
                  ...item,
                  sequence: index.toString(),
                })),
              },
            };
            setTableData(newData);
            setSemanticValidate(semanticValidator(newData));
          }}
          loading={isLoading}
        />
        <TooltipWrapper>
          <Button
            className={styles['add-btn']}
            color="primary"
            disabled={meta.length >= MAX_TABLE_META_COLUMN_LEN}
            icon={<IconAdd />}
            onClick={handleAddField}
          >
            {I18n.t('datasets_segment_tableStructure_add_field')}
          </Button>
        </TooltipWrapper>
      </div>

      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.UploadUnitNextBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('datasets_createFileModel_NextBtn'),
              disableHoverContent: I18n.t('knowledge_multi_index_noti'),
              onClick: () => {
                setCurrentStep(TableLocalResegmentStep.PREVIEW);

                fetchTableInfo({
                  ...resegmentParams,
                  table_data_type: TableDataType.OnlyPreview,
                  origin_table_meta: originTableData?.table_meta?.[0],
                  preview_table_meta: (tableData?.table_meta?.[0] || []).map(
                    (item: TableItem) => ({
                      column_name: item.column_name,
                      column_type: item.column_type,
                      desc: item.desc,
                      id: item?.is_new_column ? '0' : item.id,
                      is_semantic: item.is_semantic,
                      sequence: item.sequence,
                    }),
                  ),
                });
              },
              status: getConfigurationNextStatus(tableData, tableSettings),
            },
          ])
        : null}
    </>
  );
};
