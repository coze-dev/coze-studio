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

import { useMemo, type FC } from 'react';

import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Radio, RadioGroup } from '@coze-arch/coze-design';

import { ImageAnnotationType, ImageFileAddStep } from '../../types';
import { type ImageFileAddStore } from '../../store';

import styles from './index.module.less';

export const ImageAnnotation: FC<ContentProps<ImageFileAddStore>> = props => {
  const { useStore, footer } = props;
  const setCurrentStep = useStore(state => state.setCurrentStep);
  const annotationType = useStore(state => state.annotationType);
  const setAnnotationType = useStore(state => state.setAnnotationType);

  const buttonStatus = useMemo(() => {
    if (!annotationType) {
      return FooterBtnStatus.DISABLE;
    }
    return FooterBtnStatus.ENABLE;
  }, [annotationType]);

  return (
    <>
      <div className={styles['segment-radio-wrapper']}>
        <RadioGroup
          type="pureCard"
          onChange={e => {
            setAnnotationType(e.target.value as ImageAnnotationType);
          }}
          direction="vertical"
          value={annotationType}
        >
          <Radio
            data-testid={KnowledgeE2e.ImageAnnotationAiRadio}
            value={ImageAnnotationType.Auto}
            extra={I18n.t('knowledge_photo_009')}
          >
            {I18n.t('knowledge_photo_008')}
          </Radio>
          <Radio
            data-testid={KnowledgeE2e.ImageAnnotationManualRadio}
            value={ImageAnnotationType.Manual}
            extra={I18n.t('knowledge_photo_011')}
          >
            {I18n.t('knowledge_photo_010')}
          </Radio>
        </RadioGroup>
      </div>

      {footer?.([
        {
          e2e: KnowledgeE2e.UploadUnitUpBtn,
          type: 'primary',
          theme: 'light',
          text: I18n.t('datasets_createFileModel_previousBtn'),
          onClick: () => setCurrentStep(ImageFileAddStep.Upload),
        },
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: buttonStatus,
          onClick: () => {
            setCurrentStep(ImageFileAddStep.Process);
          },
        },
      ])}
    </>
  );
};
