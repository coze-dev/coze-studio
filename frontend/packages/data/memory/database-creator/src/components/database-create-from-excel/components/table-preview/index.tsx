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

import { type FC } from 'react';

import classnames from 'classnames';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { UITable } from '@coze-arch/bot-semi';

import { useStepStore } from '../../store/step';
import { useInitialConfigStore } from '../../store/initial-config';
import outerStyles from '../../index.module.less';
import { useStep } from '../../hooks/use-step';
import { type AddTableResponse } from '../../datamodel';
import { CreateType } from '../../../../types';

import styles from './index.module.less';

export const TablePreview: FC = () => {
  const { onSubmit } = useStep();
  const {
    botId,
    onSave,
    // spaceId
  } = useInitialConfigStore(state => ({
    botId: state.botId,
    onSave: state.onSave,
    spaceId: state.spaceId,
  }));

  const {
    currentState,
    setProcessing,
    // upload,
    tableStructure,
  } = useStepStore(state => ({
    currentState: state.step3_tablePreview,
    setProcessing: state.set_step4_processing,
    tableStructure: state.step2_tableStructure,
    upload: state.step1_upload,
  }));

  const { previewData } = currentState;
  // @ts-expect-error -- linter-disable-autofix
  const { headers, datas } = previewData;
  // const { fileList } = upload;
  const {
    // excelValue,
    tableValue,
  } = tableStructure;

  /**
   * headerPart: {
   *  0: 'name',
   *  1: 'age',
   * }
   */
  const headerPart = headers.reduce<Record<number, string>>(
    (acc, cur, index) => {
      acc[index] = cur;
      return acc;
    },
    {},
  );

  /**
   * dataPart: [
   *  {
   *    0:'Nick',
   *    1: 20
   *  },
   *  {
   *    0:'July',
   *    1: 30
   *  }
   * ]
   */
  const dataPart = datas.map(i =>
    // @ts-expect-error -- linter-disable-autofix
    i.reduce<Record<number, string>>((acc, cur, index) => {
      acc[index] = cur;
      return acc;
    }, {}),
  );

  // @ts-expect-error -- linter-disable-autofix
  const columns: ColumnProps[] = Object.entries(headerPart).map(
    ([key, value]) => ({
      title: value,
      dataIndex: key,
    }),
  );

  onSubmit(async () => {
    sendTeaEvent(EVENT_NAMES.create_table_click, {
      need_login: true,
      have_access: true,
      bot_id: botId,
      // @ts-expect-error -- linter-disable-autofix
      table_name: tableValue.name,
      database_create_type: CreateType.excel,
    });
    let res: AddTableResponse;
    try {
      // TODO: This demand is suspended, the backend is offline, and it will be opened later.
      // res = await DataModelApi.AddTable({
      //   file: {
      //     tos_uri: fileList[0].response.upload_uri,
      //     sheet_id: excelValue.sheetID,
      //     header_row: excelValue.headerRow,
      //     start_data_row: excelValue.dataStartRow,
      //   },
      //   table: {
      //     bot_id: botId,
      //     space_id: spaceId,
      //     table_name: tableValue.name,
      //     table_desc: tableValue.desc,
      //     table_meta: tableValue.tableMemoryList.map(i => ({
      //       name: i.name,
      //       desc: i.desc,
      //       type: i.type,
      //       must_required: i.must_required,
      //       sequence: i.id as string,
      //     })),
      //   },
      //   rw_mode: tableValue.readAndWriteMode as any as BotTableRWMode,
      // });
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.DATABASE, {
        eventName: REPORT_EVENTS.DatabaseAddFromExcel,
        error: error as Error,
      });
      throw error;
    }

    // @ts-expect-error -- linter-disable-autofix
    if (res) {
      if (onSave) {
        await onSave({
          response: res,
          // @ts-expect-error -- linter-disable-autofix
          stateData: tableValue,
        });
      }

      setProcessing({
        tableID: res.table_id as string,
      });
    }
  });

  return (
    <div
      className={classnames(outerStyles.stepWrapper, styles['table-preview'])}
    >
      <UITable
        tableProps={{
          columns,
          dataSource: dataPart,
          pagination: false,
          className: styles['table-preview-table'],
        }}
        wrapperClassName={styles['table-preview-table-wrapper']}
      />
    </div>
  );
};
