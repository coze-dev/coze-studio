import {
  type UploadConfig,
  type FooterControlsProps,
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { UploadFooter } from '@/components';

import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';
import { createTableCustomIncrementalStore } from './store';
import { TableUpload } from './steps';
import { TableCustomIncrementalStep } from './constants';

type TableCustomContentProps = ContentProps<
  UploadTableAction<TableCustomIncrementalStep> &
    UploadTableState<TableCustomIncrementalStep>
>;

export const TableCustomIncrementalConfig: UploadConfig<
  TableCustomIncrementalStep,
  UploadTableAction<TableCustomIncrementalStep> &
    UploadTableState<TableCustomIncrementalStep>
> = {
  steps: [
    {
      content: (props: TableCustomContentProps) => (
        <TableUpload
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step2'),
      step: TableCustomIncrementalStep.UPLOAD,
    },
  ],
  createStore: createTableCustomIncrementalStore,
  className: 'table-custom-increment-wrapper',
  showStep: false,
};
