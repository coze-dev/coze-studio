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

import { isEmpty } from 'lodash-es';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { UIEmpty } from '@coze-arch/bot-semi';
import { TableDataType } from '@coze-arch/bot-api/knowledge';

import { useOptFromQuery, tableSettingsToString } from '@/utils';
import {
  isConfigurationLoading as isLoadingFunc,
  isConfigurationError as isErrorFunc,
  isConfigurationShowBanner as isShowBannerFunc,
  getConfigurationMeta,
  getConfigurationNextStatus,
  semanticValidator,
} from '@/features/knowledge-type/table/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import {
  useChangeTableSettingsNl2ql,
  useFetchTableSchemaInfo,
} from '@/features/knowledge-type/table/hooks';
import { TableSettingFormFields } from '@/constants';
import {
  TableStructure as TableStructureInternal,
  TableSettingBar,
  ConfigurationLoading,
  ConfigurationError,
  ConfigurationBanner,
} from '@/components';

import { useUploadFetchTableParams } from '../services';
import { TableLocalStep } from '../../../constants';

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
  const setSemanticValidate = useStore(state => state.setSemanticValidate);

  /** compute action */
  const opt = useOptFromQuery();
  const isLoading = isLoadingFunc(status);
  const isError = isErrorFunc(status);
  const isShowBanner = isShowBannerFunc(opt, tableData, tableSettings);
  const currentMeta = getConfigurationMeta(tableData, tableSettings);
  const meta = currentMeta.map((item, index) => ({
    ...item,
    key: index + item.column_name,
  }));

  /** events action */
  const onChangeTableSettings = useChangeTableSettingsNl2ql(useStore);
  /** network action */
  const fetchTableParams = useUploadFetchTableParams(useStore);
  const fetchTableInfo = useFetchTableSchemaInfo<T>(useStore);
  const getContent = () => {
    if (isLoading) {
      return <ConfigurationLoading />;
    }
    if (isError) {
      return (
        <ConfigurationError
          fetchTableInfo={() => {
            fetchTableInfo({
              source_file: fetchTableParams,
              table_data_type: TableDataType.AllData,
              table_sheet: tableSettingsToString(tableSettings),
            });
          }}
        />
      );
    }
    return (
      <>
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
                [curSheet]: v,
              },
            };
            setTableData(newData);
            setSemanticValidate(semanticValidator(newData));
          }}
          loading={isLoading}
        />
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
                    table_sheet: tableSettingsToString(tableSettings),
                    table_data_type: TableDataType.OnlyPreview,
                    source_file: fetchTableParams,
                    origin_table_meta:
                      originTableData?.table_meta?.[tableSettings.sheet_id],
                    preview_table_meta:
                      tableData?.table_meta?.[tableSettings.sheet_id],
                  });
                },
                status: getConfigurationNextStatus(tableData, tableSettings),
              },
            ])
          : null}
      </>
    );
  };

  return (
    <>
      <TableSettingBar
        data={tableData}
        tableSettings={tableSettings}
        setTableSettings={onChangeTableSettings}
      />
      {getContent()}
    </>
  );
};
