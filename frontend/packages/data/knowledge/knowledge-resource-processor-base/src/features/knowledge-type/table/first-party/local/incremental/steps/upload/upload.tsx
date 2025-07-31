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

import { isEmpty } from 'lodash-es';
import {
  UnitType,
  type UnitItem,
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { TableDataType } from '@coze-arch/bot-api/knowledge';

import { useDocIdFromQuery, tableSettingsToString } from '@/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import {
  useAcceptFiles,
  useFetchTableSchemaInfo,
} from '@/features/knowledge-type/table/hooks';
import { DEFAULT_TABLE_SETTINGS_FROM_ONE, TableStatus } from '@/constants';
import { UploadUnitTable, UploadUnitFile } from '@/components';

import { useRetry, useUploadFetchTableParams } from '../services';
import { TableLocalStep } from '../../../constants';
import { getButtonStatus } from './utils';

export const TableUpload = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;

  /** common store */
  const docId = useDocIdFromQuery();
  const unitList = useStore(state => state.unitList);
  /** common action */
  const setUnitList = useStore(state => state.setUnitList);
  const setCurrentStep = useStore(state => state.setCurrentStep);

  /** table store */
  const originTableData = useStore(state => state.originTableData);
  const tableSettings = useStore(state => state.tableSettings);
  /** table action */
  const setOriginTableData = useStore(state => state.setOriginTableData);
  const setTableData = useStore(state => state.setTableData);
  const setTableSettings = useStore(state => state.setTableSettings);
  const setStatus = useStore(state => state.setStatus);

  /** event action */
  const onRetry = useRetry(useStore);
  const params = useUploadFetchTableParams(useStore);
  const fetchTableInfo = useFetchTableSchemaInfo<T>(useStore);

  useEffect(() => {
    // When deleting an uploaded file, delete the table source data synchronously
    if (!unitList.length) {
      setOriginTableData({});
      setTableData({});
      setTableSettings(DEFAULT_TABLE_SETTINGS_FROM_ONE);
    }
  }, [unitList.length]);

  const accept = useAcceptFiles();

  return (
    <>
      {
        <UploadUnitFile
          setUnitList={setUnitList}
          unitList={unitList}
          onFinish={(list: UnitItem[]) => {
            setUnitList(list);
          }}
          limit={1}
          accept={accept}
          dragMainText={I18n.t('datasets_createFileModel_step2_UploadDoc')}
          dragSubText={
            <div>
              <p>{I18n.t('datasets_unit_update_exception_tips3')}</p>
              <p>{I18n.t('knowledg_table_increment_tips')}</p>
            </div>
          }
          action={''}
          style={
            !unitList.length
              ? {}
              : {
                  display: 'none',
                }
          }
          showIllustration={false}
        />
      }
      <div className="upload-unit-table">
        <UploadUnitTable
          edit={false}
          type={UnitType.TABLE_DOC}
          unitList={unitList}
          onChange={(list: UnitItem[]) => {
            setUnitList(list);
          }}
          canValidator={false}
          onRetry={onRetry}
        />
      </div>

      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.UploadUnitNextBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('datasets_createFileModel_NextBtn'),
              onClick: () => {
                setCurrentStep(TableLocalStep.CONFIGURATION);
                if (!isEmpty(originTableData)) {
                  return;
                }
                setStatus(TableStatus.LOADING);
                fetchTableInfo({
                  source_file: params,
                  document_id: docId,
                  table_sheet: tableSettingsToString(tableSettings),
                  table_data_type: TableDataType.AllData,
                });
              },
              status: getButtonStatus(unitList),
            },
          ])
        : null}
    </>
  );
};
