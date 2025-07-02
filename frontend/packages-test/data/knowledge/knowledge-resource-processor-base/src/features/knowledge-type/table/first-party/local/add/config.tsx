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
