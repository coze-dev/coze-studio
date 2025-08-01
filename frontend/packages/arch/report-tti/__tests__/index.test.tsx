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
import { renderHook } from '@testing-library/react';

import { useReportTti } from '../src/index';

// Simulate custom-perf-metric module
vi.mock('../src/utils/custom-perf-metric', () => ({
  reportTti: vi.fn(),
  REPORT_TTI_DEFAULT_SCENE: 'init',
}));

// Import mocked functions for access in tests
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
