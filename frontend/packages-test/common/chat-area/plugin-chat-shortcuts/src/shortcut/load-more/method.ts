import { type ShortCutCommand } from '@coze-agent-ide/tool-config';

export const shortcutIconAndNameVisibleControl = (
  shortcut: ShortCutCommand,
): {
  iconVisible: boolean;
  nameVisible: boolean;
  splitLineVisible: boolean;
} => {
  const { bot_info } = shortcut;
  const iconVisible = !!bot_info?.icon_url;
  const nameVisible = !!bot_info?.name;
  const splitLineVisible = iconVisible || nameVisible;
  return { iconVisible, nameVisible, splitLineVisible };
};
