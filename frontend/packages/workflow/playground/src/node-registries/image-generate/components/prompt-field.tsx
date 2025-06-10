import { I18n } from '@coze-arch/i18n';

import { ExpressionEditorField } from '@/node-registries/common/components';
import { withField, useField, Section } from '@/form';

export const PromptField = withField(
  () => {
    const { name } = useField();
    const promptName = `${name}.prompt`;
    const negativePromptName = `${name}.negative_prompt`;
    // 保障和之前节点testID不变
    const promptTestIDSuffix = name.replace('inputs.', '');
    const negativePromptTestIDSuffix = name.replace('inputs.', '');

    return (
      <Section
        title={I18n.t('Imageflow_prompt')}
        tooltip={I18n.t('imageflow_generation_desc4')}
      >
        <ExpressionEditorField
          name={promptName}
          testIDSuffix={promptTestIDSuffix}
          label={I18n.t('Imageflow_positive')}
          placeholder={I18n.t('Imageflow_positive_placeholder')}
          required={true}
          layout="vertical"
        />
        <ExpressionEditorField
          name={negativePromptName}
          testIDSuffix={negativePromptTestIDSuffix}
          label={I18n.t('Imageflow_negative')}
          placeholder={I18n.t('Imageflow_negative_placeholder')}
          layout="vertical"
        />
      </Section>
    );
  },
  {
    hasFeedback: false,
  },
);
