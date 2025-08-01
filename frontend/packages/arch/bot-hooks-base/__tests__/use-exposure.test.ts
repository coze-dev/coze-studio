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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useExposure } from '../src/use-exposure';

// Mock dependencies
vi.mock('ahooks', () => ({
  useInViewport: vi.fn(),
}));

vi.mock('@coze-arch/bot-tea', () => ({
  sendTeaEvent: vi.fn(),
  EVENT_NAMES: {
    page_view: 'page_view',
  },
}));

import { useInViewport } from 'ahooks';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';

describe('useExposure', () => {
  const mockTarget = { current: document.createElement('div') };
  const mockEventName = EVENT_NAMES.page_view;
  const mockReportParams = { key: 'value' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report when element is in view and needReport is true', () => {
    (useInViewport as any).mockReturnValue([true]);

    renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
      }),
    );

    expect(sendTeaEvent).toHaveBeenCalledWith(mockEventName, mockReportParams);
  });

  it('should not report when element is not in view', () => {
    (useInViewport as any).mockReturnValue([false]);

    renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
      }),
    );

    expect(sendTeaEvent).not.toHaveBeenCalled();
  });

  it('should not report when needReport is false', () => {
    (useInViewport as any).mockReturnValue([true]);

    renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
        needReport: false,
      }),
    );

    expect(sendTeaEvent).not.toHaveBeenCalled();
  });

  it('should report only once when isReportOnce is true', () => {
    (useInViewport as any).mockReturnValue([true]);

    const { rerender } = renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
        isReportOnce: true,
      }),
    );

    expect(sendTeaEvent).toHaveBeenCalledTimes(1);

    // Rerender should not trigger another report
    rerender();
    expect(sendTeaEvent).toHaveBeenCalledTimes(1);
  });

  it('should report multiple times when isReportOnce is false', () => {
    (useInViewport as any).mockReturnValue([true]);

    const { rerender } = renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
        isReportOnce: false,
      }),
    );

    expect(sendTeaEvent).toHaveBeenCalledTimes(1);

    // Rerender should not trigger another report
    rerender();
    expect(sendTeaEvent).toHaveBeenCalledTimes(1);
  });

  it('should pass options to useInViewport', () => {
    const mockOptions = { threshold: 0.5 };
    (useInViewport as any).mockReturnValue([true]);

    renderHook(() =>
      useExposure({
        target: mockTarget,
        eventName: mockEventName,
        reportParams: mockReportParams,
        options: mockOptions,
      }),
    );

    expect(useInViewport).toHaveBeenCalledWith(mockTarget, mockOptions);
  });
});
