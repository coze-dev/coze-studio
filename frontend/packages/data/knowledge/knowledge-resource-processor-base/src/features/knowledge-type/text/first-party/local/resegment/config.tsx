import {
  type UploadConfig,
  type FooterControlsProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { useTextDisplaySegmentStepCheck } from '@/hooks/common';
import { UploadFooter } from '@/components';

import {
  createTextLocalResegmentStore,
  type UploadTextLocalResegmentStore,
} from './store';
import { SegmentPreviewStep, TextSegment, TextProcessing } from './steps';
import { TextLocalResegmentStep } from './constants';

export const TextLocalResegmentConfig: UploadConfig<
  TextLocalResegmentStep,
  UploadTextLocalResegmentStore
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
      title: I18n.t('kl_write_107'),
      step: TextLocalResegmentStep.SEGMENT_CLEANER,
    },
    {
      content: props => (
        <SegmentPreviewStep
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('knowlege_qqq_001'),
      step: TextLocalResegmentStep.SEGMENT_PREVIEW,
      showThisStep: () => true,
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
      step: TextLocalResegmentStep.EMBED_PROGRESS,
    },
  ],
  createStore: createTextLocalResegmentStore,
  useUploadMount: store => useTextDisplaySegmentStepCheck(),
};
