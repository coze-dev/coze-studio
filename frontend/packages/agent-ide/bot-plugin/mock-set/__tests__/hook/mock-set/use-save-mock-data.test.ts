import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { useSaveMockData } from '../../../src/hook/use-save-mock-data';

vi.mock('@coze/coze-design', () => import('@coze-arch/bot-semi'));

const mockBizCtx = {};

vi.mock('@coze-arch/bot-api', () => ({
  debuggerApi: {
    ResponseExpectType: {
      Undefined: 0,
      JSON: 1,
    },
    MockRule: {
      id: 'id',
    },
    BizCtx: {
      connectorID: 'connectorID',
    },
    SaveMockRule: vi
      .fn()
      .mockResolvedValueOnce({
        id: '123',
        status: 'success',
      })
      .mockResolvedValueOnce({
        id: '123',
        status: 'success',
      })
      .mockRejectedValueOnce({
        error: { message: 'Failed to save mock data' },
      })
      .mockRejectedValueOnce({
        error: { message: 'Failed to save mock data' },
      }),
  },
}));

describe('useSaveMockData', () => {
  it('should call onSuccess when all rules are saved successfully', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockSetId = 'mockSetId';
    const mockRules = ['rule1', 'rule2'];

    const { result } = renderHook(() =>
      useSaveMockData({
        mockSetId,
        basicParams: {
          environment: 'environment',
          workspace_id: 'workspace_id',
          workspace_type: 'personal_workspace',
          tool_id: 'tool_id',
          mock_set_id: 'mock_set_id',
        },
        bizCtx: mockBizCtx,
        onSuccess,
        onError,
      }),
    );

    await act(() => {
      result.current.save(mockRules);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should call onError and display a toast when all rules fail to save', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const mockRules = ['rule1', 'rule2'];

    const { result } = renderHook(() =>
      useSaveMockData({
        mockSetId: undefined, // 测试没有mockSetId的情况
        basicParams: {
          environment: 'environment',
          workspace_id: 'workspace_id',
          workspace_type: 'personal_workspace',
          tool_id: 'tool_id',
          mock_set_id: 'mock_set_id',
        },
        bizCtx: mockBizCtx,
        onSuccess,
        onError,
      }),
    );

    await act(() => {
      result.current.save(mockRules);
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
