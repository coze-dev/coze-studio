/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';

import type { UploadPluginConstructor } from '@/plugins/upload-plugin/types/plugin-upload';

import type { PluginKey, PluginValue } from '../types/interface';

export class PluginsService {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any -- I didn't think of a suitable type of gymnastics for the time being, use any first,
  UploadPlugin: UploadPluginConstructor<any> | null = null;
  uploadPluginConstructorOptions: Record<string, unknown> = {};

  /**
   * Register plugin
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
   * Check if the plugin has been registered
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
