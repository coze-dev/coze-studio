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

import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { useParametersInSettingModalController } from '../../../src/hooks/parameters/use-parameters-in-setting-modal-controller';

vi.mock('@coze-arch/bot-flags', () => ({
  useFlags: vi.fn(),
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn(() => ({
      getSpaceId: vi.fn(() => 'test-space-id'),
    })),
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  PluginDevelopApi: {
    GetBotDefaultParams: vi.fn().mockResolvedValue({
      request_params: [
        {
          id: '1',
          name: 'Request Param 1',
          local_default: 'Default Value 1',
        },
      ],
      response_params: [
        {
          id: '2',
          name: 'Response Param 1',
          local_default: 'Default Value 2',
        },
      ],
    }),
    UpdateBotDefaultParams: vi.fn().mockResolvedValue({
      code: 0,
    }),
  },
}));

describe('useParametersInSettingModalController', () => {
  it('should initialize requestParams and responseParams correctly', async () => {
    const { result, waitForValueToChange } = renderHook(() =>
      useParametersInSettingModalController({
        botId: 'test-bot-id',
        devId: 'test-dev-id',
        pluginId: 'test-plugin-id',
        apiName: 'test-api-name',
      }),
    );

    await waitForValueToChange(() => result.current.requestParams);

    expect(result.current.requestParams.length).toBe(1);
    expect(result.current.requestParams[0].local_default).toBe(
      'Default Value 1',
    );
    expect(result.current.responseParams.length).toBe(1);
    expect(result.current.responseParams[0].local_default).toBe(
      'Default Value 2',
    );
    expect(result.current.loaded).toBe(true);
  });

  it('should update requestParams and responseParams on handleUpdate', async () => {
    const { result } = renderHook(() =>
      useParametersInSettingModalController({
        botId: 'test-bot-id',
        devId: 'test-dev-id',
        pluginId: 'test-plugin-id',
        apiName: 'test-api-name',
      }),
    );

    await act(() => {
      result.current.doUpdateParams();
    });

    expect(result.current.isUpdateLoading).toBe(false); // Assuming isUpdateLoading is false after the update is complete
  });
});
