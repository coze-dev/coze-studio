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
