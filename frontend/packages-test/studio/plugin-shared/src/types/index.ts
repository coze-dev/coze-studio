import { type GetPluginInfoResponse } from '@coze-arch/bot-api/plugin_develop';

export type PluginInfoProps = GetPluginInfoResponse & { plugin_id?: string };
export interface ExtInfoText {
  type: 'title' | 'text' | 'br' | 'demo';
  text?: string;
}

export enum InitialAction {
  DEFAULT = 'default',
  CREATE_TOOL = 'create_tool',
  SELECT_TOOL = 'select_tool',
  PUHSLISH = 'publish',
}
