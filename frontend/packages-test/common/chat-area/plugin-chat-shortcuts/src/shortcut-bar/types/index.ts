import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import {
  type SendMessageOptions,
  type TextAndFileMixMessageProps,
  type TextMessageProps,
} from '@coze-common/chat-core';

export interface ChatShortCutBarProps {
  shortcuts: ShortCutCommand[]; // 目前支持两种快捷键
  onClickShortCut: (shortcutInfo: ShortCutCommand) => void;
}
// 更新后 home 为 white 调试区、商店为 grey
export type UIMode = 'grey' | 'white' | 'blur'; // 默认为白色，有背景的时候为模糊

export interface OnBeforeSendTemplateShortcutParams {
  message: TextAndFileMixMessageProps;
  options?: SendMessageOptions;
}

export interface OnBeforeSendQueryShortcutParams {
  message: TextMessageProps;
  options?: SendMessageOptions;
}
