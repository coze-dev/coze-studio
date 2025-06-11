import {
  type UploadConfig,
  type FooterControlsProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { UploadFooter } from '@/components';

import {
  createTextResegmentStore,
  type UploadTextResegmentStore,
} from './store';
import { TextSegment, TextProcessing } from './steps';
import { TextResegmentStep } from './constants';

export const TextResegmentConfig: UploadConfig<
  TextResegmentStep,
  UploadTextResegmentStore
> = {
  steps: [
    {
      content: props => (
        <TextSegment
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step3'),
      step: TextResegmentStep.SEGMENT_CLEANER,
    },
    {
      content: props => (
        <TextProcessing
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('datasets_createFileModel_step4'),
      step: TextResegmentStep.EMBED_PROGRESS,
    },
  ],
  createStore: createTextResegmentStore,
  showStep: true,
};
