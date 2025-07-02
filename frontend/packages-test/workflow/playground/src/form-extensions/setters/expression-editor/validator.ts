import { I18n } from '@coze-arch/i18n';
import type { ValidatorProps } from '@flowgram-adapter/free-layout-editor';

type ExpressionEditorValidatorProps = ValidatorProps<
  string,
  {
    maxLength?: number;
  }
>;

export const expressionEditorValidator = (
  props: ExpressionEditorValidatorProps,
): string | undefined => {
  const { value = '', options } = props;
  const { maxLength } = options;

  if (maxLength && value.length > maxLength) {
    return I18n.t('workflow_derail_node_detail_title_max', {
      max: maxLength,
    });
  }
};
