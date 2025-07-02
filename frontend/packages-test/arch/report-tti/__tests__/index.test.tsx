import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useReportTti } from '../src/index';

// 模拟 custom-perf-metric 模块
vi.mock('../src/utils/custom-perf-metric', () => ({
  reportTti: vi.fn(),
  REPORT_TTI_DEFAULT_SCENE: 'init',
}));

// 导入被模拟的函数，以便在测试中访问
import { reportTti } from '../src/utils/custom-perf-metric';

describe('useReportTti', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call reportTti when isLive is true', () => {
    // Arrange
    const params = {
      isLive: true,
      extra: { key: 'value' },
    };

    // Act
    renderHook(() => useReportTti(params));

    // Assert
    expect(reportTti).toHaveBeenCalledTimes(1);
    expect(reportTti).toHaveBeenCalledWith(params.extra, 'init');
  });

  it('should not call reportTti when isLive is false', () => {
    // Arrange
    const params = {
      isLive: false,
      extra: { key: 'value' },
    };

    // Act
    renderHook(() => useReportTti(params));

    // Assert
    expect(reportTti).not.toHaveBeenCalled();
  });

  it('should call reportTti with custom scene when provided', () => {
    // Arrange
    const params = {
      isLive: true,
      extra: { key: 'value' },
      scene: 'custom-scene',
    };

    // Act
    renderHook(() => useReportTti(params));

    // Assert
    expect(reportTti).toHaveBeenCalledTimes(1);
    expect(reportTti).toHaveBeenCalledWith(params.extra, params.scene);
  });

  it('should not call reportTti again if dependencies do not change', () => {
    // Arrange
    const params = {
      isLive: true,
      extra: { key: 'value' },
    };

    // Act
    const { rerender } = renderHook(() => useReportTti(params));
    rerender();

    // Assert
    expect(reportTti).toHaveBeenCalledTimes(1);
  });

  it('should call reportTti again if isLive changes from false to true', () => {
    // Arrange
    const initialParams = {
      isLive: false,
      extra: { key: 'value' },
    };

    // Act
    const { rerender } = renderHook(props => useReportTti(props), {
      initialProps: initialParams,
    });

    // Assert
    expect(reportTti).not.toHaveBeenCalled();

    // Act - change isLive to true
    rerender({
      isLive: true,
      extra: { key: 'value' },
    });

    // Assert
    expect(reportTti).toHaveBeenCalledTimes(1);
    expect(reportTti).toHaveBeenCalledWith(initialParams.extra, 'init');
  });
});
