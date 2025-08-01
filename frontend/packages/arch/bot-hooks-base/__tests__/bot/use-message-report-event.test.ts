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

import { useParams } from 'react-router-dom';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { messageReportEvent } from '@coze-arch/bot-utils';

import { useMessageReportEvent } from '../../src/bot/use-message-report-event';

// Mock dependencies
vi.mock('@coze-arch/bot-utils', () => ({
  messageReportEvent: {
    start: vi.fn(),
    interrupt: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

describe('useMessageReportEvent', () => {
  const mockBotId = 'test-bot-id';

  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({ bot_id: mockBotId });
  });

  it('should start message report event with correct parameters', () => {
    renderHook(() => useMessageReportEvent());

    expect(messageReportEvent.start).toHaveBeenCalledWith(mockBotId);
  });

  it('should not start message report event when bot_id is not available', () => {
    (useParams as any).mockReturnValue({ bot_id: undefined });

    renderHook(() => useMessageReportEvent());

    expect(messageReportEvent.start).not.toHaveBeenCalled();
  });

  it('should interrupt message report event on unmount', () => {
    const { unmount } = renderHook(() => useMessageReportEvent());

    unmount();

    expect(messageReportEvent.interrupt).toHaveBeenCalled();
  });

  it('should restart message report event when bot_id changes', () => {
    const { rerender } = renderHook(() => useMessageReportEvent());

    expect(messageReportEvent.start).toHaveBeenCalledTimes(1);
    expect(messageReportEvent.start).toHaveBeenCalledWith(mockBotId);

    const newBotId = 'new-bot-id';
    (useParams as any).mockReturnValue({ bot_id: newBotId });

    rerender();

    expect(messageReportEvent.start).toHaveBeenCalledTimes(2);
    expect(messageReportEvent.start).toHaveBeenCalledWith(newBotId);
  });
});
