import {
  type RoleMessageSetValue,
  type NicknameVariableMessageSetValue,
  type RoleSpeakerValue,
  type NicknameSpeakerValue,
} from './types';

export const isRoleMessageSetValue = (
  value: RoleMessageSetValue | NicknameVariableMessageSetValue,
): value is RoleMessageSetValue => value.biz_role_id !== '';

export const isRoleSpeakerValue = (
  value: RoleSpeakerValue | NicknameSpeakerValue,
): value is RoleSpeakerValue => (value as RoleSpeakerValue).biz_role_id !== '';
