/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  ROLE_INFORMATION_KEYWORD,
  DEFAULT_ROLE_NAME,
  DEFAULT_NICKNAME_NAME,
  DEFAULT_PLAYER_DESCRIPTION_NAME,
} from '../constants';

export const getSceneFlowDefaultOutput = () => [
  {
    key: nanoid(),
    name: ROLE_INFORMATION_KEYWORD,
    type: ViewVariableType.ArrayObject,
    description: I18n.t('scene_workflow_start_roles', {}, '角色信息'),
    isPreset: true,
    enabled: true,
    children: [
      {
        key: nanoid(),
        name: DEFAULT_ROLE_NAME,
        type: ViewVariableType.String,
        description: I18n.t('scene_workflow_start_roles_name', {}, '角色名称'),
        isPreset: true,
        enabled: true,
      },
      {
        key: nanoid(),
        name: DEFAULT_NICKNAME_NAME,
        type: ViewVariableType.String,
        description: I18n.t('scene_workflow_start_roles_nickname', {}, '昵称'),
        isPreset: true,
        enabled: true,
      },
      {
        key: nanoid(),
        name: DEFAULT_PLAYER_DESCRIPTION_NAME,
        type: ViewVariableType.String,
        description: I18n.t(
          'scene_workflow_start_roles_introduce',
          {},
          '玩家描述',
        ),
        isPreset: true,
        enabled: true,
      },
    ],
  },
];
export const getRoleInformationFromOutputs = (outputs: any[] | undefined) =>
  (outputs || []).find(item => item.name === ROLE_INFORMATION_KEYWORD);

export const isRoleInformationName = (name: string) =>
  name === ROLE_INFORMATION_KEYWORD ||
  name === DEFAULT_ROLE_NAME ||
  name === DEFAULT_NICKNAME_NAME ||
  name === DEFAULT_PLAYER_DESCRIPTION_NAME;

export const deepMap = (obj: any[], handler: (item: any) => any) =>
  obj.map(item => {
    if (!item.children) {
      return handler(item);
    } else {
      return {
        ...handler(item),
        children: deepMap(item.children, handler),
      };
    }
  });
