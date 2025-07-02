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
