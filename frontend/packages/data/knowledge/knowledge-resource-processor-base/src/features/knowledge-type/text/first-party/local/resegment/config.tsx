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
