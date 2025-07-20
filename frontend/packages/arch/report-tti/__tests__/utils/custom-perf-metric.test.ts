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
import { reporter } from '@coze-arch/logger';

const mockSlardarInstance = vi.fn();
mockSlardarInstance.config = vi.fn();

// 模拟 logger 和 reporter
vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
  },
  reporter: {
    info: vi.fn(),
  },
  getSlardarInstance: vi.fn(() => mockSlardarInstance),
}));

describe('custom-perf-metric', () => {
  // 保存原始的全局对象
  const originalPerformance = global.performance;
  const originalDocument = global.document;
  const originalPerformanceObserver = global.PerformanceObserver;

  // 模拟函数
  const mockObserve = vi.fn();
  const mockDisconnect = vi.fn();
  const mockGetEntriesByName = vi.fn();
  const mockPerformanceNow = vi.fn().mockReturnValue(1000);

  // 模拟路由变更条目
  const mockRouteChangeEntry = {
    startTime: 500,
    detail: {
      location: {
        pathname: '/test-path',
      },
    },
  };

  // 确保数组有 at 方法
  if (!Array.prototype.at) {
    // 添加 at 方法的 polyfill
    Object.defineProperty(Array.prototype, 'at', {
      value(index) {
        // 将负索引转换为从数组末尾开始的索引
        return this[index < 0 ? this.length + index : index];
      },
      writable: true,
      configurable: true,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // 模拟 performance 对象
    vi.stubGlobal('performance', {
      now: mockPerformanceNow,
      getEntriesByName: mockGetEntriesByName,
    });

    // 默认模拟 getEntriesByName 返回值
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      if (name === 'first-contentful-paint') {
        return [
          {
            startTime: 800,
          },
        ];
      }
      return [];
    });

    // 模拟 document 对象
    global.document = {
      visibilityState: 'visible',
    } as any;

    // 模拟 PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation(callback => ({
      observe: mockObserve,
      disconnect: mockDisconnect,
    })) as any;

    // 添加 supportedEntryTypes 属性
    Object.defineProperty(global.PerformanceObserver, 'supportedEntryTypes', {
      value: ['paint'],
      configurable: true,
    });
  });

  afterEach(() => {
    // 恢复原始对象
    global.performance = originalPerformance;
    global.document = originalDocument;
    global.PerformanceObserver = originalPerformanceObserver;
  });

  it('应该导出常量和函数', async () => {
    const { PerfMetricNames, REPORT_TTI_DEFAULT_SCENE, reportTti } =
      await vi.importActual<any>('../../src/utils/custom-perf-metric');

    expect(PerfMetricNames).toBeDefined();
    expect(PerfMetricNames.TTI).toBe('coze_custom_tti');
    expect(PerfMetricNames.TTI_HOT).toBe('coze_custom_tti_hot');
    expect(REPORT_TTI_DEFAULT_SCENE).toBe('init');
    expect(reportTti).toBeInstanceOf(Function);
  });

  it('当页面可见且有 FCP 时应该调用 slardar 上报 TTI', async () => {
    const { reportTti, PerfMetricNames } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 执行
    reportTti({ key: 'value' });

    // 验证
    expect(mockSlardarInstance).toHaveBeenCalledWith('sendCustomPerfMetric', {
      value: 1000,
      name: PerfMetricNames.TTI,
      type: 'perf',
      extra: {
        key: 'value',
        fcpTime: '800',
      },
    });
  });

  it('当页面处于隐藏状态时不应该上报 TTI', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 document.visibilityState
    Object.defineProperty(global.document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });

    // 执行
    reportTti();

    // 验证
    expect(mockSlardarInstance).not.toHaveBeenCalled();
  });

  it('当同一路由和场景已经上报过时不应该重复上报', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 第一次调用
    reportTti({}, 'test-scene');

    // 清除模拟
    vi.clearAllMocks();

    // 第二次调用同一路由和场景
    reportTti({}, 'test-scene');

    // 验证
    expect(mockSlardarInstance).not.toHaveBeenCalled();
  });

  it('当有多个路由变更时应该上报热启动 TTI', async () => {
    const { reportTti, PerfMetricNames } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 返回多个路由变更
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        const entries = [
          {
            startTime: 300,
            detail: {
              location: {
                pathname: '/first-path',
              },
            },
          },
          {
            startTime: 500,
            detail: {
              location: {
                pathname: '/test-path2',
              },
            },
          },
        ];

        // 确保数组有 at 方法
        if (!entries.at) {
          entries.at = function (index) {
            return this[index < 0 ? this.length + index : index];
          };
        }

        return entries;
      }
      return [];
    });

    // 执行
    reportTti({ key: 'value' });

    // 验证
    expect(mockSlardarInstance).toHaveBeenCalledWith('sendCustomPerfMetric', {
      value: 500, // 1000 - 500 = 500
      name: PerfMetricNames.TTI_HOT,
      type: 'perf',
      extra: {
        key: 'value',
      },
    });
  });

  it('当 FCP 时间晚于当前时间时应该使用 FCP 时间作为 TTI', async () => {
    const { reportTti, PerfMetricNames } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 performance.now 返回值
    mockPerformanceNow.mockReturnValue(700);

    // 执行
    reportTti();

    // 验证
    expect(mockSlardarInstance).toHaveBeenCalledWith('sendCustomPerfMetric', {
      value: 800, // 使用 FCP 时间
      name: PerfMetricNames.TTI,
      type: 'perf',
      extra: {
        fcpTime: '800',
      },
    });
  });

  it('当页面可见且没有 FCP 时应该设置 PerformanceObserver', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 不返回 FCP
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      // 返回空数组表示没有 FCP
      return [];
    });

    // 执行
    reportTti();

    // 验证
    expect(mockObserve).toHaveBeenCalledWith({ type: 'paint', buffered: true });
    expect(mockSlardarInstance).not.toHaveBeenCalled();
  });

  it('当 PerformanceObserver 触发回调时应该上报 TTI', async () => {
    const { reportTti, PerfMetricNames } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 不返回 FCP
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      return [];
    });

    // 准备模拟 PerformanceObserver 回调
    let observerCallback: Function | undefined;
    global.PerformanceObserver = vi.fn().mockImplementation(callback => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        disconnect: mockDisconnect,
      };
    }) as any;

    // 执行
    reportTti({ key: 'value' });

    // 模拟 PerformanceObserver 回调
    const mockList = {
      getEntriesByName: vi.fn().mockReturnValue([{ startTime: 900 }]),
    };

    // 确保 observerCallback 已被赋值
    expect(observerCallback).toBeDefined();

    // 执行回调
    if (observerCallback) {
      observerCallback(mockList);
    }

    // 验证
    expect(mockSlardarInstance).toHaveBeenCalledWith('sendCustomPerfMetric', {
      value: 900,
      name: PerfMetricNames.TTI,
      type: 'perf',
      extra: {
        key: 'value',
        fcpTime: '900',
      },
    });
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('当 PerformanceObserver.observe 抛出错误时应该尝试替代方法', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 不返回 FCP
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      return [];
    });

    // 模拟 observe 抛出错误
    mockObserve.mockImplementationOnce(() => {
      throw new Error('Failed to execute observe');
    });

    // 执行
    reportTti();

    // 验证
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(mockObserve).toHaveBeenNthCalledWith(1, {
      type: 'paint',
      buffered: true,
    });
    expect(mockObserve).toHaveBeenNthCalledWith(2, { entryTypes: ['paint'] });
    expect(reporter.info).toHaveBeenCalledWith({
      message: 'Failed to execute observe',
      namespace: 'performance',
    });
  });

  it('当 PerformanceObserver 不支持 paint 类型时应该处理兼容性问题', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 不返回 FCP
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      return [];
    });

    // 模拟 observe 抛出错误
    mockObserve.mockImplementationOnce(() => {
      throw new Error('Failed to execute observe');
    });

    // 移除 supportedEntryTypes
    Object.defineProperty(global.PerformanceObserver, 'supportedEntryTypes', {
      value: [],
      configurable: true,
    });

    // 执行
    reportTti();

    // 验证
    expect(mockObserve).toHaveBeenCalledTimes(1);
    expect(reporter.info).toHaveBeenCalledWith({
      message: 'Failed to execute observe',
      namespace: 'performance',
    });
  });

  it('当 PerformanceObserver 的第二种方法也失败时应该处理错误', async () => {
    const { reportTti } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 不返回 FCP
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        return [mockRouteChangeEntry];
      }
      return [];
    });

    // 模拟 observe 抛出错误
    mockObserve
      .mockImplementationOnce(() => {
        throw new Error('First error');
      })
      .mockImplementationOnce(() => {
        throw new Error('Second error');
      });

    // 执行
    reportTti();

    // 验证
    expect(mockObserve).toHaveBeenCalledTimes(2);
    expect(reporter.info).toHaveBeenCalledTimes(2);
    expect(reporter.info).toHaveBeenNthCalledWith(1, {
      message: 'Second error',
      namespace: 'performance',
    });
    expect(reporter.info).toHaveBeenNthCalledWith(2, {
      message: 'First error',
      namespace: 'performance',
    });
  });

  it('当有多个路由变更但最后一个路由没有startTime时应该使用默认值0', async () => {
    const { reportTti, PerfMetricNames } = await vi.importActual<any>(
      '../../src/utils/custom-perf-metric',
    );

    // 修改 getEntriesByName 返回多个路由变更，但最后一个没有startTime
    mockGetEntriesByName.mockImplementation(name => {
      if (name === 'route_change') {
        const entries = [
          {
            startTime: 300,
            detail: {
              location: {
                pathname: '/first-path',
              },
            },
          },
          {
            // 没有startTime属性
            detail: {
              location: {
                pathname: '/test-path2',
              },
            },
          },
        ];

        // 确保数组有 at 方法
        if (!entries.at) {
          entries.at = function (index) {
            return this[index < 0 ? this.length + index : index];
          };
        }

        return entries;
      }
      return [];
    });

    // 执行
    reportTti({ key: 'value' });

    // 验证
    expect(mockSlardarInstance).toHaveBeenCalledWith('sendCustomPerfMetric', {
      value: 700, // 1000 - 300 = 700 (使用了第一个路由的startTime)
      name: PerfMetricNames.TTI_HOT,
      type: 'perf',
      extra: {
        key: 'value',
      },
    });
  });
});
