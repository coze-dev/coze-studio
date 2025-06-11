import { SpaceRoleType } from '@coze-arch/bot-api/plugin_develop';
import { I18n } from '@coze-arch/i18n';
export { type GetUserAuthorityData } from '@coze-arch/bot-api/plugin_develop';
export { CreationMethod } from '@coze-arch/bot-api/plugin_develop';

export const ROLE_TAG_TEXT_MAP = {
  [SpaceRoleType.Owner]: I18n.t('team_management_role_owner', {}, 'Owner'),
  [SpaceRoleType.Admin]: I18n.t('team_management_role_admin', {}, 'Admin'),
  [SpaceRoleType.Member]: I18n.t('team_management_role_member', {}, 'Member'),
  [SpaceRoleType.Default]: '-',
} as const;

export { SpaceRoleType };
