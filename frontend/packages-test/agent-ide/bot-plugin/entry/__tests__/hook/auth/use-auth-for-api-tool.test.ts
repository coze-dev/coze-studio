import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { OAuthStatus } from '@coze-arch/bot-api/plugin_develop';

import { useAuthForApiTool } from '@/hooks/auth/use-auth-for-api-tool';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    error: vi.fn(),
  },
  createLoggerWith: vi.fn(),
}));

vi.mock('@coze-studio/bot-plugin-store', () => ({
  usePluginStore: vi.fn().mockReturnValue({
    pluginInfo: {
      plugin_id: 'plugin_id',
      canEdit: !0,
    },
  }),
}));

vi.mock('@coze-arch/bot-api', () => ({
  PluginDevelopApi: {
    RevokeAuthToken: vi
      .fn()
      .mockRejectedValueOnce(new Error('mockRejectedValue'))
      .mockResolvedValue(0),
    GetOAuthStatus: vi
      .fn()
      .mockResolvedValueOnce({
        is_oauth: !0,
        status: OAuthStatus.Authorized,
        content: 'content',
      })
      .mockResolvedValueOnce({
        is_oauth: !0,
        status: OAuthStatus.Unauthorized,
        content: 'content',
      })
      .mockResolvedValueOnce({
        is_oauth: !!0,
      })
      .mockResolvedValueOnce({
        is_oauth: !0,
        status: OAuthStatus.Unauthorized,
        content: 'content',
      }),
  },
}));

vi.stubGlobal('open', vi.fn());

describe('useAuthForApiTool', () => {
  it('useAuthForApiTool (三方服务 & 已授权 => 取消授权失败 => 取消授权成功) is pass', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuthForApiTool());

    await waitForNextUpdate();

    expect(result.current.needAuth).toBe(!0);

    expect(result.current.isHasAuth).toBe(!0);

    try {
      await act(async () => await result.current.doCancelOauth());
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }

    expect(result.current.isHasAuth).toBe(!0);

    await act(async () => await result.current.doCancelOauth());

    expect(result.current.isHasAuth).toBe(!!0);
  });

  it('useAuthForApiTool (非三方服务 & 无需授权) is pass', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuthForApiTool());

    await waitForNextUpdate();

    expect(result.current.needAuth).toBe(!!0);

    expect(result.current.isHasAuth).toBe(!!0);
  });

  it('useAuthForApiTool (三方服务 & 未授权 => 去授权) is pass', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuthForApiTool());

    await waitForNextUpdate();

    expect(result.current.needAuth).toBe(!0);

    expect(result.current.isHasAuth).toBe(!!0);

    act(() => result.current.doOauth());
  });
});
