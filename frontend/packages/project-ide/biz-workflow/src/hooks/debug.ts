import { ProjectResourceActionKey } from '@coze-arch/bot-api/plugin_develop';

export const workflowActions = [
  {
    key: ProjectResourceActionKey.Rename,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.Copy,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.MoveToLibrary,
    enable: false,
    hint: '不能移动到资源库',
  },
  {
    key: ProjectResourceActionKey.CopyToLibrary,
    enable: true,
    hint: '复制到资源库',
  },
  {
    // 切换为 chatflow
    key: ProjectResourceActionKey.SwitchToChatflow,
    enable: true,
  },
  {
    key: ProjectResourceActionKey.Delete,
    enable: true,
  },
];
