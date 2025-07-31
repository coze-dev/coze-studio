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
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { UploadFooter } from '@/components';

import { TableLocalStep } from '../constants';
import { useTableCheck } from '../../hooks';
import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';
import { createTableLocalAddStore } from './store';
import {
  TableUpload,
  TableConfiguration,
  TablePreview,
  TableProcessing,
} from './steps';

type TableLocalContentProps = ContentProps<
  UploadTableAction<TableLocalStep> & UploadTableState<TableLocalStep>
>;

export const TableLocalAddConfig: UploadConfig<
  TableLocalStep,
  UploadTableAction<TableLocalStep> & UploadTableState<TableLocalStep>
> = {
  steps: [
    {
      content: (props: TableLocalContentProps) => (
        <TableUpload
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step2'),
      step: TableLocalStep.UPLOAD,
    },
    {
      content: (props: TableLocalContentProps) => (
        <TableConfiguration
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_tab_step2'),
      step: TableLocalStep.CONFIGURATION,
    },
    {
      content: (props: TableLocalContentProps) => (
        <TablePreview
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_tab_step3'),
      step: TableLocalStep.PREVIEW,
    },
    {
      content: (props: TableLocalContentProps) => (
        <TableProcessing
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step4'),
      step: TableLocalStep.PROCESSING,
    },
  ],
  createStore: createTableLocalAddStore,
  className: 'table-local-wrapper',
  useUploadMount: store => useTableCheck(store),
};
