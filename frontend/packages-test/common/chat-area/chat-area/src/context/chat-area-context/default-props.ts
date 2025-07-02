import { UploadPlugin } from '../../service/upload-plugin';
import { type ChatAreaConfigs } from './type';

export const defaultConfigs: ChatAreaConfigs = {
  showFunctionCallDetail: true,
  ignoreMessageConfigList: [],
  groupUserMessage: false,
  uploadPlugin: UploadPlugin,
};
