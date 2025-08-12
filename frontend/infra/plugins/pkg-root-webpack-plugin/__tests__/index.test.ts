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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RushConfiguration } from '@rushstack/rush-sdk';
import OriginPkgRootWebpackPlugin from '@coze-arch/pkg-root-webpack-plugin-origin';

import PkgRootWebpackPlugin from '../src/index';

// Mock @coze-arch/pkg-root-webpack-plugin-origin
vi.mock('@coze-arch/pkg-root-webpack-plugin-origin', () => ({
  default: vi.fn().mockImplementation(function (this: any, options: any) {
    this.options = options;
  }),
}));

// Mock @rushstack/rush-sdk
vi.mock('@rushstack/rush-sdk', () => ({
  RushConfiguration: {
    loadFromDefaultLocation: vi.fn(),
  },
}));

describe('PkgRootWebpackPlugin', () => {
  const mockRushConfiguration = {
    projects: [
      { projectFolder: 'packages/project1' },
      { projectFolder: 'packages/project2' },
      { projectFolder: 'apps/app1' },
      { projectFolder: 'apps/app2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (RushConfiguration.loadFromDefaultLocation as any).mockReturnValue(
      mockRushConfiguration,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('应该正确导出 PkgRootWebpackPlugin 类', () => {
    expect(PkgRootWebpackPlugin).toBeDefined();
    expect(typeof PkgRootWebpackPlugin).toBe('function');
  });

  it('应该能够创建 PkgRootWebpackPlugin 实例', () => {
    const plugin = new PkgRootWebpackPlugin();
    expect(plugin).toBeInstanceOf(PkgRootWebpackPlugin);
    expect(plugin).toBeInstanceOf(OriginPkgRootWebpackPlugin);
  });

  it('应该使用默认配置创建插件', () => {
    new PkgRootWebpackPlugin();

    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      root: '@',
      packagesDirs: [
        'packages/project1',
        'packages/project2',
        'apps/app1',
        'apps/app2',
      ],
      excludeFolders: [],
    });
  });

  it('应该能够合并用户提供的配置选项', () => {
    const customOptions = {
      customProp: 'customValue',
      excludeFolders: ['custom-exclude'],
    };

    new PkgRootWebpackPlugin(customOptions);

    // Note: Subsequent objects in Object.assign overwrite the preceding objects, so the default configuration overrides the user configuration
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      customProp: 'customValue',
      root: '@', // Overwritten by default
      packagesDirs: [
        'packages/project1',
        'packages/project2',
        'apps/app1',
        'apps/app2',
      ],
      excludeFolders: [], // Overwritten by default
    });
  });

  it('默认配置会覆盖用户提供的 root 配置', () => {
    const customOptions = {
      root: '$',
    };

    new PkgRootWebpackPlugin(customOptions);

    // Object.assign behavior: subsequent objects overwrite previous object properties
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      root: '@', // Overwritten by default
      packagesDirs: [
        'packages/project1',
        'packages/project2',
        'apps/app1',
        'apps/app2',
      ],
      excludeFolders: [],
    });
  });

  it('应该能够处理空的配置选项', () => {
    new PkgRootWebpackPlugin({});

    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      root: '@',
      packagesDirs: [
        'packages/project1',
        'packages/project2',
        'apps/app1',
        'apps/app2',
      ],
      excludeFolders: [],
    });
  });

  it('验证所有导出都正确', () => {
    // Verify that the module exported the correct class and the default export
    expect(PkgRootWebpackPlugin).toBeDefined();
    expect(typeof PkgRootWebpackPlugin).toBe('function');
  });

  it('应该正确处理 Rush 配置中的项目文件夹', () => {
    new PkgRootWebpackPlugin();

    // Verify that the packagesDirs passed to the parent class contain all project folders
    const call = (OriginPkgRootWebpackPlugin as any).mock.calls[0];
    const options = call[0];

    expect(options.packagesDirs).toEqual([
      'packages/project1',
      'packages/project2',
      'apps/app1',
      'apps/app2',
    ]);
  });

  it('测试插件基本功能正常工作', () => {
    // This test verifies that the plugin can instantiate and call the parent class constructor normally
    new PkgRootWebpackPlugin();

    // Verify that the parent class constructor is indeed called
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalled();
  });
});
