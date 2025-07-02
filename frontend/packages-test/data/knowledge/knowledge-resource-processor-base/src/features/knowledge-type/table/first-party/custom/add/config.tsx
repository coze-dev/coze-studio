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
