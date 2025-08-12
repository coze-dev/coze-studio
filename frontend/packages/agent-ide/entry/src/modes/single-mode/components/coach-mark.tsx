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

import { I18n } from '@coze-arch/i18n';
import Coachmark, { StepCard } from '@coze-common/biz-components/coachmark';

import promptDiffGuideI18NPNG from '../../../assets/coachmark/prompt-diff-guide.i18n.png';
import promptDiffGuideCNPNG from '../../../assets/coachmark/prompt-diff-guide.cn.png';
import modelSelectGuideI18NPNG from '../../../assets/coachmark/model-diff-guide.i18n.png';
import modelSelectGuideCNPNG from '../../../assets/coachmark/model-diff-guide.cn.png';
export const CoachMark = () => (
  <Coachmark
    steps={[
      {
        content: (
          <StepCard
            imgSrc={IS_OVERSEA ? promptDiffGuideI18NPNG : promptDiffGuideCNPNG}
            content={I18n.t('compare_guide_description_prompt')}
            title={I18n.t('compare_guide_title_prompt')}
          />
        ),
        target: '#prompt_diff_coachmark_target',
      },
      {
        content: (
          <StepCard
            imgSrc={
              IS_OVERSEA ? modelSelectGuideI18NPNG : modelSelectGuideCNPNG
            }
            content={I18n.t('compare_guide_description_model')}
            title={I18n.t('compare_guide_title_model')}
          />
        ),
        target: '#model_select_coachmark_target',
      },
    ]}
    caseId="singleAgentDiffGuide"
  />
);
