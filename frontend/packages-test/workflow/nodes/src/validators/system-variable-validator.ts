import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';
import { I18n } from '@coze-arch/i18n';

export function systemVariableValidator({ value }: ValidatorProps<string>) {
  const trimmed = value?.trim() || '';
  if (trimmed.startsWith('sys_')) {
    return I18n.t('variable_240416_01') || ' ';
  }

  return true;
}
