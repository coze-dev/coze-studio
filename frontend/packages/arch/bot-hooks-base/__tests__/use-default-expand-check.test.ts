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

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock dependencies
vi.mock('@coze-studio/bot-detail-store', () => ({
  useBotDetailIsReadonly: vi.fn(),
}));

vi.mock('@coze-studio/bot-detail-store/page-runtime', () => ({
  usePageRuntimeStore: vi.fn(),
}));

vi.mock('@coze-arch/bot-utils', () => ({
  skillKeyToApiStatusKeyTransformer: vi.fn(),
}));

import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { skillKeyToApiStatusKeyTransformer } from '@coze-arch/bot-utils';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { useDefaultExPandCheck } from '../src/use-default-expand-check';

describe('useDefaultExPandCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useBotDetailIsReadonly as any).mockReturnValue(false);
    (skillKeyToApiStatusKeyTransformer as any).mockReturnValue(
      'transformedKey',
    );
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: true,
      botSkillBlockCollapsibleState: {},
    });
  });

  it('should return undefined when when is false', () => {
    const { result } = renderHook(() =>
      useDefaultExPandCheck(
        {
          blockKey: 'test' as any,
          configured: true,
        },
        false,
      ),
    );

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when init is false', () => {
    (usePageRuntimeStore as any).mockReturnValue({
      init: false,
      editable: true,
      botSkillBlockCollapsibleState: {},
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: true,
      }),
    );

    expect(result.current).toBeUndefined();
  });

  it('should return undefined when botSkillBlockCollapsibleState is empty', () => {
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: true,
      botSkillBlockCollapsibleState: {},
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: true,
      }),
    );

    expect(result.current).toBeUndefined();
  });

  it('should return true when state is Open', () => {
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: true,
      botSkillBlockCollapsibleState: {
        transformedKey: TabStatus.Open,
      },
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: true,
      }),
    );

    expect(result.current).toBe(true);
  });

  it('should return false when state is Close', () => {
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: true,
      botSkillBlockCollapsibleState: {
        transformedKey: TabStatus.Close,
      },
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: true,
      }),
    );

    expect(result.current).toBe(false);
  });

  it('should return configured value when readonly', () => {
    (useBotDetailIsReadonly as any).mockReturnValue(true);
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: true,
      botSkillBlockCollapsibleState: {
        transformedKey: TabStatus.Open,
      },
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: true,
      }),
    );

    expect(result.current).toBe(true);
  });

  it('should return configured value when not editable', () => {
    (usePageRuntimeStore as any).mockReturnValue({
      init: true,
      editable: false,
      botSkillBlockCollapsibleState: {
        transformedKey: TabStatus.Open,
      },
    });

    const { result } = renderHook(() =>
      useDefaultExPandCheck({
        blockKey: 'test' as any,
        configured: false,
      }),
    );

    expect(result.current).toBe(false);
  });
});
