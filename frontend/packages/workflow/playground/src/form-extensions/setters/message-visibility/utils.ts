import { type NicknameVariableSetting, type RoleSetting } from './types';

export function isRoleUserSettings(
  userSettings: RoleSetting[] | NicknameVariableSetting[],
) {
  return (userSettings as RoleSetting[]).some(item => item.biz_role_id !== '');
}
