import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';
export interface CreateAnswerContentValidatorOptions {
  fieldEnabled?: (...props: Parameters<Validate>) => boolean;
}
export const createAnswerContentValidator =
  (options?: CreateAnswerContentValidatorOptions): Validate<string> =>
  props => {
    if (options?.fieldEnabled && !options?.fieldEnabled?.(props)) {
      return;
    }
    const { value } = props;
    if (!value) {
      return I18n.t('workflow_detail_node_error_empty');
    }
  };
