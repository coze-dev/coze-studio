import { type ReactNode } from 'react';

import { type RoleType } from '@coze-arch/idl/social_api';

export enum MessageGenerateMode {
  FixedContent = 0,
  GenerateByAgent = 1,
}

export interface OtherMessageSetValue {
  generate_mode: MessageGenerateMode;
  content: string;
}
export type RoleMessageSetValue = RoleSpeakerValue & OtherMessageSetValue;
export type NicknameVariableMessageSetValue = NicknameSpeakerValue &
  OtherMessageSetValue;

export type SpeakerMessageSetValue =
  | RoleMessageSetValue
  | NicknameVariableMessageSetValue;

export interface RoleSpeakerValue {
  biz_role_id: string;
  role: string;
  nickname?: string;
  role_type: RoleType;
}
export interface NicknameSpeakerValue {
  biz_role_id: '';
  role: '';
  nickname: string;
  role_type: undefined;
}

export type SpeakerSelectValue = RoleSpeakerValue | NicknameSpeakerValue;

export interface RoleSpeaker extends RoleSpeakerValue {
  role: string;
}
export interface NicknameSpeaker extends NicknameSpeakerValue {
  role: '';
}

export interface SpeakerSelectOption {
  label: ReactNode;
  value: string;
  biz_role_id: string;
  role: string;
  nickname: string;
  extra: RoleSpeakerValue | NicknameSpeakerValue;
  role_type?: string;
}

export type SpeakerSelectDataSource = Array<SpeakerSelectOption>;

export enum SpeakerType {
  Role = '1',
  Nickname = '2',
}

export interface Feedback {
  success: boolean;
  error?: Array<{
    code: string;
    message: string;
  }>;
}
