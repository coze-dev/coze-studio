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
  type FooterControlsProps,
  type UploadConfig,
} from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';

import { useImageDisplayAnnotationStepCheck } from '@/hooks/common';
import { UploadFooter } from '@/components';

import { ImageFileAddStep } from './types';
import { createImageFileAddStore, type ImageFileAddStore } from './store';
import { ImageUpload } from './steps/upload';
import { ImageProcess } from './steps/process';
import { ImageAnnotation } from './steps/annotation';

export const ImageFileAddConfig: UploadConfig<
  ImageFileAddStep,
  ImageFileAddStore
> = {
  steps: [
    {
      title: I18n.t('knowledge_photo_006'),
      step: ImageFileAddStep.Upload,
      content: props => (
        <ImageUpload
          {...props}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
        />
      ),
    },
    {
      title: I18n.t('knowledge_photo_007'),
      step: ImageFileAddStep.Annotation,
      content: props => (
        <ImageAnnotation
          {...props}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
        />
      ),
    },
    {
      title: I18n.t('db_table_0126_015'),
      step: ImageFileAddStep.Process,
      content: props => (
        <ImageProcess
          {...props}
          footer={(controls: FooterControlsProps) => (
            <UploadFooter controls={controls} />
          )}
        />
      ),
    },
  ],
  createStore: createImageFileAddStore,
  useUploadMount: store => useImageDisplayAnnotationStepCheck(),
};
