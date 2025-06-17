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

    // 注意：Object.assign 中后面的对象会覆盖前面的对象，所以默认配置会覆盖用户配置
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      customProp: 'customValue',
      root: '@', // 被默认值覆盖
      packagesDirs: [
        'packages/project1',
        'packages/project2',
        'apps/app1',
        'apps/app2',
      ],
      excludeFolders: [], // 被默认值覆盖
    });
  });

  it('默认配置会覆盖用户提供的 root 配置', () => {
    const customOptions = {
      root: '$',
    };

    new PkgRootWebpackPlugin(customOptions);

    // Object.assign 的行为：后面的对象会覆盖前面的对象属性
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalledWith({
      root: '@', // 被默认值覆盖
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
    // 验证模块导出了正确的类和默认导出
    expect(PkgRootWebpackPlugin).toBeDefined();
    expect(typeof PkgRootWebpackPlugin).toBe('function');
  });

  it('应该正确处理 Rush 配置中的项目文件夹', () => {
    new PkgRootWebpackPlugin();

    // 验证传递给父类的 packagesDirs 包含所有项目文件夹
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
    // 这个测试验证插件能正常实例化并调用父类构造函数
    new PkgRootWebpackPlugin();

    // 验证确实调用了父类构造函数
    expect(OriginPkgRootWebpackPlugin).toHaveBeenCalled();
  });
});
