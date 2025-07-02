import { I18n } from '@coze-arch/i18n';
import type { Validate } from '@flowgram-adapter/free-layout-editor';

interface CreateExpressionEditorValidatorOptions {
  maxLength?: number;
}

export const createExpressionEditorValidator =
  (options?: CreateExpressionEditorValidatorOptions): Validate<string> =>
  ({ value }): string | undefined => {
    if (!value) {
      return I18n.t('workflow_detail_node_error_empty');
    }
    const { maxLength } = options || {};

    if (maxLength && value.length > maxLength) {
      return I18n.t('workflow_derail_node_detail_title_max', {
        max: maxLength,
      });
    }
  };
