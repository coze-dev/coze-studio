import {
  type UploadConfig,
  type FooterControlsProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { useTextDisplaySegmentStepCheck } from '@/hooks/common';
import { UploadFooter } from '@/components';

import {
  createTextLocalAddUpdateStore,
  type UploadTextLocalAddUpdateStore,
} from './store';
import { SegmentPreviewStep } from './steps/preview';
import { TextUpload, TextSegment, TextProcessing } from './steps';
import { TextLocalAddUpdateStep } from './constants';

export const TextLocalAddUpdateConfig: UploadConfig<
  TextLocalAddUpdateStep,
  UploadTextLocalAddUpdateStore
> = {
  steps: [
    {
      content: props => (
        <TextUpload
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={props.checkStatus}
        />
      ),
      title: I18n.t('datasets_createFileModel_step2'),
      step: TextLocalAddUpdateStep.UPLOAD_FILE,
    },
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
      step: TextLocalAddUpdateStep.SEGMENT_CLEANER,
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
      step: TextLocalAddUpdateStep.SEGMENT_PREVIEW,
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
      step: TextLocalAddUpdateStep.EMBED_PROGRESS,
    },
  ],
  createStore: createTextLocalAddUpdateStore,
  useUploadMount: store => useTextDisplaySegmentStepCheck(),
};
