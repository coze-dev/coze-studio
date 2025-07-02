import { I18n } from '@coze-arch/i18n';

export const GLOBAL_VARIABLE_SCOPE_ID = 'globalVariableScope';
export const WORKFLOW_VARIABLE_SOURCE = 'block-output_';
export const TRANS_WORKFLOW_VARIABLE_SOURCE = 'block_output_';

export enum GlobalVariableKey {
  System = 'global_variable_system',
  User = 'global_variable_user',
  App = 'global_variable_app',
}

export const allGlobalVariableKeys = [
  GlobalVariableKey.System,
  GlobalVariableKey.User,
  GlobalVariableKey.App,
];

export const GLOBAL_VAR_ALIAS_MAP: Record<string, string> = {
  [GlobalVariableKey.App]: I18n.t('variable_app_name'),
  [GlobalVariableKey.User]: I18n.t('variable_user_name'),
  [GlobalVariableKey.System]: I18n.t('variable_system_name'),
};

export const isGlobalVariableKey = (key: string) =>
  allGlobalVariableKeys.includes(key as GlobalVariableKey);

export const getGlobalVariableAlias = (key = '') =>
  isGlobalVariableKey(key) ? GLOBAL_VAR_ALIAS_MAP[key] : undefined;
