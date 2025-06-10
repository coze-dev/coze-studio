import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';

import type { UploadPluginConstructor } from '@/plugins/upload-plugin/types/plugin-upload';

import type { PluginKey, PluginValue } from '../types/interface';

export class PluginsService {
  //eslint-disable-next-line  @typescript-eslint/no-explicit-any -- 暂时没想到合适的类型体操， 先用 any,
  UploadPlugin: UploadPluginConstructor<any> | null = null;
  uploadPluginConstructorOptions: Record<string, unknown> = {};

  /**
   * 注册插件
   */
  registerPlugin<T extends PluginKey, P extends Record<string, unknown>>(
    key: T,
    plugin: PluginValue<T, P>,
    constructorOptions?: P,
  ) {
    if (key === 'upload-plugin') {
      this.UploadPlugin = plugin;
      this.uploadPluginConstructorOptions = constructorOptions || {};
    }
  }

  /**
   * 检查插件是否已经注册过
   */
  checkPluginIsRegistered(key: PluginKey): boolean {
    if (key === 'upload-plugin') {
      return !!this.UploadPlugin;
    }

    return false;
  }

  getRegisteredPlugin(key: PluginKey) {
    if (key === 'upload-plugin') {
      return this.UploadPlugin;
    }
    exhaustiveCheckSimple(key);
  }
}
