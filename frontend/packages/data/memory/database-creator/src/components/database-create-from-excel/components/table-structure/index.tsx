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

import { useRef, type FC, useState, useMemo } from 'react';

import { nanoid } from 'nanoid';
import classnames from 'classnames';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Form } from '@coze-arch/bot-semi';
import {
  ColumnType,
  type GetTableSchemaInfoResponse,
  type FieldItemType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { type ExcelValue } from '../../types';
import { useStepStore } from '../../store/step';
import { useInitialConfigStore } from '../../store/initial-config';
import outerStyles from '../../index.module.less';
import { useStep } from '../../hooks/use-step';
import { type PreviewTableFileResponse } from '../../datamodel';
import {
  DatabaseTableStructure,
  type DatabaseTableStructureRef,
} from '../../../database-table-structure';
import { type TableFieldsInfo, CreateType } from '../../../../types';

import styles from './index.module.less';

export const TableStructure: FC = () => {
  const { onSubmit, onValidate, computingEnableGoToNextStep, onPrevious } =
    useStep();

  const {
    botId,
    maxColumnNum,
    // spaceId
  } = useInitialConfigStore(state => ({
    botId: state.botId,
    maxColumnNum: state.maxColumnNum,
    spaceId: state.spaceId,
  }));

  const { currentState, setCurrentState, upload, setTablePreview } =
    useStepStore(state => ({
      currentState: state.step2_tableStructure,
      setCurrentState: state.set_step2_tableStructure,
      setTablePreview: state.set_step3_tablePreview,
      upload: state.step1_upload,
    }));

  const { excelBasicInfo, excelValue, tableValue } = currentState;
  const { fileList } = upload;

  const [loading, setLoading] = useState(false);

  // ref
  const excelInfoFormRef = useRef<Form<ExcelValue>>(null);
  const tableFormRef = useRef<DatabaseTableStructureRef>(null);

  // options
  // @ts-expect-error -- linter-disable-autofix
  const currentSheet = excelBasicInfo.find(i => i.id === excelValue.sheetID);
  // @ts-expect-error -- linter-disable-autofix
  const sheetOptions = excelBasicInfo.map(i => ({
    label: i.sheet_name,
    value: i.id,
  }));
  const currentSheetTotalRow = useMemo(() => {
    // @ts-expect-error -- linter-disable-autofix
    let totalRow = currentSheet.total_row;
    if (totalRow < 2) {
      totalRow = 2;
    }
    if (totalRow > 50) {
      totalRow = 50;
    }
    return totalRow;
    // @ts-expect-error -- linter-disable-autofix
  }, [currentSheet.total_row]);

  const headerRowOptions = new Array(currentSheetTotalRow - 1)
    .fill(0)
    .map((_, i) => ({
      label: I18n.t('datasets_createFileModel_tab_dataStarRow_value', {
        LineNumber: i + 1,
      }),
      value: i + 1,
    }));
  const dataStartRowOptions = new Array(currentSheetTotalRow)
    .fill(0)
    .map((_, i) => ({
      label: I18n.t('datasets_createFileModel_tab_dataStarRow_value', {
        LineNumber: i + 1,
      }),
      value: i + 1,
    }))
    // @ts-expect-error -- linter-disable-autofix
    .filter(i => i.value >= excelValue.headerRow + 1);

  onSubmit(() => {
    const tableBasicValue =
      // @ts-expect-error -- linter-disable-autofix
      tableFormRef.current.tableBasicInfoFormRef.current.formApi.getValues();

    let res: PreviewTableFileResponse;
    try {
      // TODO: This demand is suspended, the backend is offline, and it will be opened later.
      // res = await DataModelApi.PreviewTableFile({
      //   file: {
      //     tos_uri: fileList[0].response.upload_uri,
      //     sheet_id: excelValue.sheetID,
      //     header_row: excelValue.headerRow,
      //     start_data_row: excelValue.dataStartRow,
      //   },
      //   table: {
      //     space_id: spaceId,
      //     bot_id: botId,
      //     table_name: tableBasicValue.name,
      //     table_desc: tableBasicValue.desc,
      //     table_meta: tableFormRef.current.tableFieldsList.map(i => ({
      //       name: i.name,
      //       desc: i.desc,
      //       type: i.type,
      //       must_required: i.must_required,
      //       sequence: i.id as string,
      //     })),
      //   },
      // });
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.DATABASE, {
        eventName: REPORT_EVENTS.DatabaseGetPreviewData,
        error: error as Error,
      });
      throw error;
    }

    // @ts-expect-error -- linter-disable-autofix
    if (res) {
      setTablePreview({
        previewData: res.preview_data,
      });
      setCurrentState({
        tableValue: {
          // @ts-expect-error -- linter-disable-autofix
          tableMemoryList: tableFormRef.current.tableFieldsList,
          ...tableBasicValue,
          // @ts-expect-error -- linter-disable-autofix
          tableId: tableValue.tableId,
        },
      });
    }
  });

  // Previous Save the current state
  onPrevious(() => {
    const tableBasicValue =
      // @ts-expect-error -- linter-disable-autofix
      tableFormRef.current.tableBasicInfoFormRef.current.formApi.getValues();
    setCurrentState({
      tableValue: {
        // @ts-expect-error -- linter-disable-autofix
        tableMemoryList: tableFormRef.current.tableFieldsList,
        ...tableBasicValue,
        // @ts-expect-error -- linter-disable-autofix
        tableId: tableValue.tableId,
      },
    });
  });

  // @ts-expect-error -- linter-disable-autofix
  onValidate(async () => await tableFormRef.current.validate());

  return (
    <div
      className={classnames(outerStyles.stepWrapper, styles['table-structure'])}
    >
      <Form<ExcelValue>
        ref={excelInfoFormRef}
        layout="horizontal"
        // @ts-expect-error -- linter-disable-autofix
        initValues={{ ...excelValue }}
        className={styles['excel-info-form']}
        onValueChange={async (values, changedValue) => {
          const changedKeys = Object.keys(changedValue);

          const reloadTableValue = async (
            params: {
              updateTableName?: boolean;
            } = {},
          ) => {
            const { updateTableName = false } = params;
            const basicInfo =
              // @ts-expect-error -- linter-disable-autofix
              tableFormRef.current.tableBasicInfoFormRef.current.formApi.getValues();
            setLoading(true);

            let res: GetTableSchemaInfoResponse;
            try {
              res = await MemoryApi.GetTableSchemaInfo({
                // @ts-expect-error -- linter-disable-autofix
                tos_uri: fileList[0].response.upload_uri,
                doc_table_info: {
                  sheet_id: values.sheetID,
                  header_line_idx: values.headerRow - 1,
                  start_line_idx: values.dataStartRow - 1,
                } as any,
              });
            } catch (error) {
              dataReporter.errorEvent(DataNamespace.DATABASE, {
                eventName: REPORT_EVENTS.DatabaseGetExcelInfo,
                error: error as Error,
              });
              throw error;
            }
            if (res) {
              // @ts-expect-error -- linter-disable-autofix
              const newTableMemoryList: TableFieldsInfo = res.table_meta.map(
                i => ({
                  name: i.column_name,
                  nanoid: nanoid(),
                  desc: '',
                  type:
                    i.column_type === ColumnType.Unknown
                      ? undefined
                      : (i.column_type as any as FieldItemType),
                  must_required: false,
                  disableMustRequired: i.contains_empty_value,
                }),
              );
              setCurrentState({
                excelValue: { ...values },
                tableValue: {
                  name: updateTableName
                    ? // @ts-expect-error -- linter-disable-autofix
                      excelBasicInfo.find(i => i.id === values.sheetID)
                        ?.sheet_name || basicInfo.name
                    : basicInfo.name,
                  desc: basicInfo.desc,
                  readAndWriteMode: basicInfo.readAndWriteMode,
                  tableId: '',
                  tableMemoryList: newTableMemoryList,
                },
              });
              // @ts-expect-error -- linter-disable-autofix
              tableFormRef.current.setTableFieldsList(newTableMemoryList);
            }
            setLoading(false);
          };

          if (changedKeys.length === 1 && changedKeys.includes('sheetID')) {
            // FIXME: There is a bug in semi here, and it is always override update, so you need to add the sheetID attribute as well.
            // @ts-expect-error -- linter-disable-autofix
            excelInfoFormRef.current.formApi.setValues({
              sheetID: changedValue.sheetID,
              headerRow: 1,
              dataStartRow: 2,
            });
          }

          // Switch sheet
          if (
            changedKeys.length === 3 &&
            changedKeys.includes('headerRow') &&
            changedKeys.includes('dataStartRow') &&
            changedKeys.includes('sheetID')
          ) {
            await reloadTableValue({ updateTableName: true });
          }

          // Update headerRow only
          if (changedKeys.length === 1 && changedKeys.includes('headerRow')) {
            // @ts-expect-error -- linter-disable-autofix
            if (changedValue.headerRow >= values.dataStartRow) {
              // @ts-expect-error -- linter-disable-autofix
              excelInfoFormRef.current.formApi.setValue(
                'dataStartRow',
                // @ts-expect-error -- linter-disable-autofix
                changedValue.headerRow + 1,
              );
            } else {
              await reloadTableValue();
            }
          }

          // Update dataStartRow only
          if (
            changedKeys.length === 1 &&
            changedKeys.includes('dataStartRow')
          ) {
            await reloadTableValue();
          }
        }}
      >
        <Form.Select
          field="sheetID"
          label={I18n.t('datasets_createFileModel_tab_DataSheet')}
          dropdownClassName={styles['table-setting-option']}
          optionList={sheetOptions}
        />
        <Form.Select
          field="headerRow"
          label={I18n.t('datasets_createFileModel_tab_header')}
          dropdownClassName={styles['table-setting-option']}
          optionList={headerRowOptions}
        />
        <Form.Select
          field="dataStartRow"
          label={I18n.t('datasets_createFileModel_tab_dataStarRow')}
          dropdownClassName={styles['table-setting-option']}
          optionList={dataStartRowOptions}
        />
      </Form>
      <DatabaseTableStructure
        // @ts-expect-error -- linter-disable-autofix
        data={tableValue}
        botId={botId}
        forceEdit
        ref={tableFormRef}
        useComputingEnableGoToNextStep={(tableFieldsList: TableFieldsInfo) => {
          computingEnableGoToNextStep(() => {
            const currentLength = tableFieldsList.length;
            return currentLength >= 1 && currentLength <= maxColumnNum;
          });
        }}
        loading={loading}
        enableAdd={false}
        readAndWriteModeOptions="excel"
        maxColumnNum={maxColumnNum}
        createType={CreateType.excel}
      />
    </div>
  );
};
