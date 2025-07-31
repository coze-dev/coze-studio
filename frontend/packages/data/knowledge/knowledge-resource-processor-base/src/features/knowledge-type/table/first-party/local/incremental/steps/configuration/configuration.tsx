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

import { useEffect, useRef, useState } from 'react';

import { isEmpty } from 'lodash-es';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { UIEmpty } from '@coze-arch/bot-semi';
import { isApiError } from '@coze-arch/bot-http';
import { DocumentSource, TableDataType } from '@coze-arch/bot-api/knowledge';

import { tableSettingsToString } from '@/utils';
import {
  isConfigurationLoading as isLoadingFunc,
  isConfigurationError as isErrorFunc,
  getExpandConfigurationMeta,
  semanticValidator,
} from '@/features/knowledge-type/table/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import {
  useChangeTableSettingsNl2ql,
  useFetchTableSchemaInfo,
  useTableSchemaValid,
} from '@/features/knowledge-type/table/hooks';
import { TableSettingFormFields } from '@/constants';
import {
  TableStructure as TableStructureInternal,
  TableSettingBar,
  ConfigurationLoading,
  ConfigurationError,
} from '@/components';

import { useUploadFetchTableParams } from '../services';
import styles from '../index.module.less';
import { TableLocalStep } from '../../../constants';

interface TableHeaderProps {
  isTableStructureError: boolean;
}

const validErrorCode = '708024073';

const TableHeader = ({ isTableStructureError }: TableHeaderProps) => (
  <>
    <div className={styles['validation-results']}>
      <div className={styles['validation-item']}></div>
      <div className={styles['validation-item']}>
        {isTableStructureError ? (
          <p className={styles['error-msg']}>
            {I18n.t('knowledg_table_structure_err_msg')}
          </p>
        ) : null}
        <p className={styles.tips}>{I18n.t('knowledg_table_structure_tips')}</p>
      </div>
      <div className={styles['validation-item']}></div>
    </div>
    <div
      className={styles['table-structure-title']}
      data-testid={KnowledgeE2e.TableLocalTableStructureTitle}
    >
      {I18n.t('datasets_segment_tableStructure_title')}
    </div>
  </>
);

// eslint-disable-next-line @coze-arch/max-line-per-function
export const TableConfiguration = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;
  const setCurrentStep = useStore(state => state.setCurrentStep);

  const status = useStore(state => state.status);
  const tableData = useStore(state => state.tableData);
  const originTableData = useStore(state => state.originTableData);
  const tableSettings = useStore(state => state.tableSettings);
  const semanticValidate = useStore(state => state.semanticValidate);
  const setTableData = useStore(state => state.setTableData);
  const setSemanticValidate = useStore(state => state.setSemanticValidate);

  const isLoading = isLoadingFunc(status);
  const [validate, setValidate] = useState(false);
  const isConfigurationError = isErrorFunc(status);
  const [isTableStructureError, setIsTableStructureError] = useState(false);
  const validResultRef = useRef<Record<string, string>>({});
  const meta = getExpandConfigurationMeta(
    tableData,
    tableSettings,
    validResultRef.current,
  );
  const onChangeTableSettings = useChangeTableSettingsNl2ql(useStore);
  const uploadParams = useUploadFetchTableParams(useStore);
  const params = useKnowledgeParams();
  const fetchTableInfo = useFetchTableSchemaInfo<T>(useStore);
  const tableSchemaValid = useTableSchemaValid(
    (state, result) => {
      setIsTableStructureError(!state);
      setValidate(state);
      validResultRef.current = result;
    },
    err => {
      if (isApiError(err) && err?.code === validErrorCode) {
        setIsTableStructureError(true);
      }
      setValidate(false);
      validResultRef.current = {};
    },
  );
  useEffect(() => {
    if (tableSettings) {
      setValidate(false);
      tableSchemaValid({
        space_id: params.spaceID || '',
        document_id: params.docID || '',
        source_file: {
          tos_uri: uploadParams.tos_uri || '',
          document_source: DocumentSource.Document,
        },
        table_sheet: {
          sheet_id: tableSettings.sheet_id.toString(),
          header_line_idx: tableSettings.header_line_idx.toString(),
          start_line_idx: tableSettings.start_line_idx.toString(),
        },
      });
    }
  }, [tableSettings]);
  if (isLoading) {
    return <ConfigurationLoading />;
  }

  if (isConfigurationError) {
    return (
      <ConfigurationError
        fetchTableInfo={() => {
          fetchTableInfo({
            ...uploadParams,
            document_id: params.docID,
            table_data_type: TableDataType.AllData,
            table_sheet: tableSettingsToString(tableSettings),
          });
        }}
      />
    );
  }

  return (
    <>
      <TableSettingBar
        className={`${styles['table-setting-bar-container']} ${
          isTableStructureError ? styles['is-error'] : ''
        }`}
        data={tableData}
        tableSettings={tableSettings}
        setTableSettings={onChangeTableSettings}
      />
      <TableHeader isTableStructureError={isTableStructureError} />
      {!meta.length || isEmpty(originTableData) ? (
        <UIEmpty
          empty={{
            title: I18n.t('knowledge_1221_02'),
            icon: <IllustrationNoResult></IllustrationNoResult>,
          }}
        />
      ) : (
        <TableStructureInternal
          initValid={false}
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
                [curSheet]: v,
              },
            };
            setTableData(newData);
            setSemanticValidate(semanticValidator(newData));
          }}
          loading={isLoading}
          isPreview={true}
        />
      )}
      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.UploadUnitUpBtn,
              type: 'primary',
              theme: 'light',
              text: I18n.t('datasets_createFileModel_previousBtn'),
              onClick: () => {
                setCurrentStep(TableLocalStep.UPLOAD);
              },
              status: FooterBtnStatus.ENABLE,
            },
            {
              e2e: KnowledgeE2e.UploadUnitNextBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('datasets_createFileModel_NextBtn'),
              onClick: () => {
                setCurrentStep(TableLocalStep.PREVIEW);
                fetchTableInfo({
                  table_data_type: TableDataType.OnlyPreview,
                  source_file: uploadParams,
                  document_id: params.docID,
                  origin_table_meta:
                    originTableData?.table_meta?.[tableSettings.sheet_id],
                  preview_table_meta:
                    tableData?.table_meta?.[tableSettings.sheet_id],
                  table_sheet: tableSettingsToString(tableSettings),
                });
              },
              status: validate
                ? FooterBtnStatus.ENABLE
                : FooterBtnStatus.DISABLE,
            },
          ])
        : null}
    </>
  );
};
