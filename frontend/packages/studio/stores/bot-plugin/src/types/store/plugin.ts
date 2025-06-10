import {
  type GetUserAuthorityData,
  type GetUpdatedAPIsResponse,
  type GetPluginInfoResponse,
} from '@/types';

interface PluginState {
  readonly pluginId: string;
  readonly spaceID: string;
  projectID?: string;
  isUnlocking: boolean;
  auth?: GetUserAuthorityData;
  canEdit: boolean;
  updatedInfo?: GetUpdatedAPIsResponse;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  initSuccessed: boolean;
  version?: string;
}

interface PluginGetter {
  getIsIdePlugin: () => boolean;
}

interface PluginAction {
  initUserPluginAuth: () => void;
  checkPluginIsLockedByOthers: () => Promise<boolean>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  unlockPlugin: () => Promise<void>;
  setPluginInfo: (info: PluginState['pluginInfo']) => void;
  setUpdatedInfo: (info: GetUpdatedAPIsResponse) => void;
  initPlugin: () => Promise<void>;
  initTool: () => Promise<void>;
  init: () => Promise<void>;
  setCanEdit: (can: boolean) => void;
  setInitSuccessed: (v: boolean) => void;
}

export type BotPluginStateAction = PluginState & PluginGetter & PluginAction;
