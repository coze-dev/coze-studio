import {
  type UploadConfig,
  type FooterControlsProps,
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import {
  type UploadTableAction,
  type UploadTableState,
} from '@/features/knowledge-type/table/index';
import { UploadFooter } from '@/components';

import { createTableLocalResegmentStore } from './store';
import { TableConfiguration, TablePreview, TableProcessing } from './steps';
import { TableLocalResegmentStep } from './constants';

type TableLocalResegmentContentProps = ContentProps<
  UploadTableAction<TableLocalResegmentStep> &
    UploadTableState<TableLocalResegmentStep>
>;

export const TableResegmentConfig: UploadConfig<
  TableLocalResegmentStep,
  UploadTableAction<TableLocalResegmentStep> &
    UploadTableState<TableLocalResegmentStep>
> = {
  steps: [
    {
      content: (props: TableLocalResegmentContentProps) => (
        <TableConfiguration
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_tab_step2'),
      step: TableLocalResegmentStep.CONFIGURATION,
    },
    {
      content: (props: TableLocalResegmentContentProps) => (
        <TablePreview
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_tab_step3'),
      step: TableLocalResegmentStep.PREVIEW,
    },
    {
      content: (props: TableLocalResegmentContentProps) => (
        <TableProcessing
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step4'),
      step: TableLocalResegmentStep.PROCESSING,
    },
  ],
  createStore: createTableLocalResegmentStore,
};
