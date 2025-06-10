import {
  type UploadConfig,
  type FooterControlsProps,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { useTextDisplaySegmentStepCheck } from '@/hooks/common';
import { UploadFooter } from '@/components';

import {
  createTextCustomAddUpdateStore,
  type UploadTextCustomAddUpdateStore,
} from './store';
import { TextUpload, TextSegment, TextProcessing } from './steps';
import { TextCustomAddUpdateStep } from './constants';

export const TextCustomAddUpdateConfig: UploadConfig<
  TextCustomAddUpdateStep,
  UploadTextCustomAddUpdateStore
> = {
  steps: [
    {
      content: props => (
        <TextUpload
          useStore={props.useStore}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
          checkStatus={undefined}
        />
      ),
      title: I18n.t('knowledge_upload_text_custom_add_title'),
      step: TextCustomAddUpdateStep.UPLOAD_CONTENT,
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
      step: TextCustomAddUpdateStep.SEGMENT_CLEANER,
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
      step: TextCustomAddUpdateStep.EMBED_PROGRESS,
    },
  ],
  createStore: createTextCustomAddUpdateStore,
  useUploadMount: store => useTextDisplaySegmentStepCheck(),
};
