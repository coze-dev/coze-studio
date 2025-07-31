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

import {
  type UploadConfig,
  type FooterControlsProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { UploadFooter } from '@/components';

import { useTableCheck } from '../../hooks';
import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';
import { type TableLocalContentProps } from './types';
import { createTableCustomAddStore } from './store';
import { TableCustomCreate } from './steps';
import { TableCustomStep, TABLE_CUSTOM_WRAPPER_CLASS_NAME } from './constant';

export const TableCustomAddConfig: UploadConfig<
  TableCustomStep,
  UploadTableAction<TableCustomStep> & UploadTableState<TableCustomStep>
> = {
  steps: [
    {
      content: (props: TableLocalContentProps) => (
        <TableCustomCreate
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step2'),
      step: TableCustomStep.CREATE,
    },
  ],
  createStore: createTableCustomAddStore,
  showStep: false,
  className: TABLE_CUSTOM_WRAPPER_CLASS_NAME,
  useUploadMount: store => useTableCheck(store),
};
