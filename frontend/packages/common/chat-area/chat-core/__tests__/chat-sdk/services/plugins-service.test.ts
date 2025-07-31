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

import type { UploadPluginConstructor } from '@/plugins/upload-plugin/types/plugin-upload';
import { PluginsService } from '@/chat-sdk/services/plugins-service';

describe('PluginsService', () => {
  let service: PluginsService;
  let mockPlugin: UploadPluginConstructor<any>;

  beforeEach(() => {
    service = new PluginsService();
    mockPlugin = vi.fn() as unknown as UploadPluginConstructor<any>;
  });

  it('registers an upload plugin successfully', () => {
    service.registerPlugin('upload-plugin', mockPlugin, { option1: 'value1' });
    expect(service.UploadPlugin).toBe(mockPlugin);
    expect(service.uploadPluginConstructorOptions).toEqual({
      option1: 'value1',
    });
  });

  it('returns true when checking if upload plugin is registered', () => {
    service.registerPlugin('upload-plugin', mockPlugin);
    expect(service.checkPluginIsRegistered('upload-plugin')).toBe(true);
  });

  it('returns false when checking if upload plugin is not registered', () => {
    expect(service.checkPluginIsRegistered('upload-plugin')).toBe(false);
  });

  it('retrieves the registered upload plugin', () => {
    service.registerPlugin('upload-plugin', mockPlugin);
    const plugin = service.getRegisteredPlugin('upload-plugin');
    expect(plugin).toBe(mockPlugin);
  });
  it('overwrites an existing plugin when registering a new one with the same key', () => {
    const anotherMockPlugin =
      vi.fn() as unknown as UploadPluginConstructor<any>;
    service.registerPlugin('upload-plugin', mockPlugin, { option1: 'value1' });
    service.registerPlugin('upload-plugin', anotherMockPlugin, {
      option2: 'value2',
    });
    expect(service.UploadPlugin).toBe(anotherMockPlugin);
    expect(service.uploadPluginConstructorOptions).toEqual({
      option2: 'value2',
    });
  });
});
