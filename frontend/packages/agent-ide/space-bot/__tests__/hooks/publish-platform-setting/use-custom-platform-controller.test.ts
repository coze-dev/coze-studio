import { act, renderHook } from '@testing-library/react-hooks';

import { useCustomPlatformController } from '@/hook/publish-platform-setting/use-custom-platform-controller';

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => ({}),
}));

vi.mock('@coze-arch/bot-api', () => ({
  connectorApi: {
    ListConnector: vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            name: 'test',
            type: 'mysql',
            config: {},
            status: 'ok',
          },
        ],
      })
      .mockRejectedValueOnce([]),
  },
}));

describe('use-custom-platform-controller', () => {
  it('use-custom-platform-controller datasource and action should be right', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useCustomPlatformController(),
    );

    act(() => result.current.doRefreshDatasource());

    await waitForValueToChange(() => result.current.dataSource);

    expect(result.current.dataSource.length).toBe(1);
    expect(result.current.loading).toBeFalsy();

    act(() => result.current.doRefreshDatasource());
    await waitForValueToChange(() => result.current.dataSource);

    expect(result.current.dataSource.length).toBe(0);
  });

  it('use-custom-platform-controller actionTarget should be right', () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useCustomPlatformController(),
    );

    act(() =>
      result.current.doSetActionTarget({ target: 'oauth', action: 'create' }),
    );

    waitForValueToChange(() => result.current.actionTarget);

    expect(result.current.actionTarget).toEqual({
      target: 'oauth',
      action: 'create',
    });
  });

  it('use-custom-platform-controller copy-action should be right', () => {
    const { result } = renderHook(() => useCustomPlatformController());

    act(() => result.current.doCopy('test'));
  });
});
