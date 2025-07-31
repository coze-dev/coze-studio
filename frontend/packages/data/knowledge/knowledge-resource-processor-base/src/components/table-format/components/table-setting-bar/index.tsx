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

import React, { useMemo, useRef } from 'react';

import { get, isNumber } from 'lodash-es';
import classNames from 'classnames';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Form } from '@coze-arch/bot-semi';
import { type GetDocumentTableInfoResponse } from '@coze-arch/bot-api/memory';
import { FormSelect } from '@coze-arch/coze-design';

import { type TableSettings } from '@/types';
import { TableSettingFormFields } from '@/constants';

import { initIndexOptions } from './utils';

import styles from './index.module.less';

export interface TableSettingBarProps {
  className?: string;
  data: GetDocumentTableInfoResponse;
  tableSettings: TableSettings;
  setTableSettings: (values: TableSettings) => void;
}

const minOptLen = 2;
export const TableSettingBar: React.FC<TableSettingBarProps> = ({
  className = '',
  data = {},
  tableSettings,
  setTableSettings,
}) => {
  const { preview_data, sheet_list } = data;
  if (!preview_data || !sheet_list || !sheet_list.length) {
    return <></>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const formApi = useRef<FormApi<TableSettings>>();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const sheet = useMemo(
    () => get(sheet_list, tableSettings[TableSettingFormFields.SHEET]),
    [sheet_list, tableSettings],
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const initValues = useMemo(() => tableSettings, [sheet_list]);

  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  const settings = useMemo(() => {
    const options =
      !sheet.id && sheet.id !== 0
        ? []
        : initIndexOptions(
            Number(sheet?.total_row) > 1 ? Number(sheet.total_row) : minOptLen,
            0,
          );
    return [
      {
        e2e: KnowledgeE2e.TableLocalTableConfigurationDataSheet,
        field: TableSettingFormFields.SHEET,
        label: I18n.t('datasets_createFileModel_tab_DataSheet'),
        options: sheet_list.map(s => ({
          value: s.id,
          label: s.sheet_name,
        })),
      },
      {
        e2e: KnowledgeE2e.TableLocalTableConfigurationSheetHeader,
        field: TableSettingFormFields.KEY_START_ROW,
        label: I18n.t('datasets_createFileModel_tab_header'),
        options: options.slice(0, options.length - 1),
      },
      {
        e2e: KnowledgeE2e.TableLocalTableConfigurationStarRow,
        field: TableSettingFormFields.DATA_START_ROW,
        label: I18n.t('datasets_createFileModel_tab_dataStarRow'),
        // The starting row of the data must be larger than the header row
        options: options.slice(
          Number(tableSettings[TableSettingFormFields.KEY_START_ROW]) + 1,
        ),
      },
    ];
  }, [data, sheet]);

  const handleFormChange = (
    values: TableSettings,
    changedValue: Partial<TableSettings>,
  ) => {
    if (setTableSettings) {
      setTableSettings({ ...values });
    }

    const curSheet = get(changedValue, TableSettingFormFields.SHEET);
    const curKeyStartRow = get(
      changedValue,
      TableSettingFormFields.KEY_START_ROW,
    );
    if (isNumber(curSheet) && formApi.current) {
      // Modify the sheet, initialize the header and data rows
      formApi.current.setValue(TableSettingFormFields.KEY_START_ROW, 0);
      formApi.current.setValue(TableSettingFormFields.DATA_START_ROW, 1);
    }
    if (curKeyStartRow && formApi.current) {
      const dataStartRow = get(values, TableSettingFormFields.DATA_START_ROW);
      if (!(curKeyStartRow < dataStartRow)) {
        formApi.current.setValue(
          TableSettingFormFields.DATA_START_ROW,
          curKeyStartRow + 1,
        );
      }
    }
  };

  return (
    <div className={classNames(styles['table-setting-bar'], className)}>
      <Form<typeof initValues>
        layout="horizontal"
        initValues={initValues}
        getFormApi={api => (formApi.current = api)}
        onValueChange={(values, changedValue) => {
          handleFormChange(values, changedValue);
        }}
      >
        {settings.map(setting => {
          const { options, ...selectProps } = setting;
          return (
            <FormSelect
              data-testid={setting.e2e}
              key={setting.field}
              optionList={options}
              {...selectProps}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(v?: string | number | any[] | Record<string, any>) => {
                if (!v) {
                  return;
                }
                handleFormChange(
                  { ...tableSettings, [setting.field]: v as unknown as number },
                  { [setting.field]: v as unknown as number },
                );
              }}
            />
          );
        })}
      </Form>
    </div>
  );
};
