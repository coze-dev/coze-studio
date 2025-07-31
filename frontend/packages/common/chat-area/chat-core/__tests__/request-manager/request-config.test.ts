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

import { RequestScene } from '@/request-manager/types';
import { getDefaultSceneConfig } from '@/request-manager/request-config';
import { ApiError } from '@/request-manager/api-error';

describe('getDefaultSceneConfig', () => {
  it('returns the default scene configuration with hooks', () => {
    const config = getDefaultSceneConfig();

    expect(config.hooks.onBeforeRequest).toHaveLength(1);
    expect(config.hooks.onAfterResponse).toHaveLength(1);
  });

  it('calls useApiErrorResponseHook on non-zero response code', async () => {
    const response = { data: { code: 1, msg: 'Error' }, status: 200 };
    const config = getDefaultSceneConfig();

    await expect(
      config.hooks.onAfterResponse[0](response as any),
    ).rejects.toThrow(ApiError);
  });

  it('calls useCsrfRequestHook and sets headers for POST requests without content-type', () => {
    const config = { method: 'POST', headers: new Map(), data: undefined };
    const defaultConfig = getDefaultSceneConfig();

    const modifiedConfig = defaultConfig.hooks.onBeforeRequest[0](
      config as any,
    );

    expect(modifiedConfig.headers.get('x-requested-with')).toBe(
      'XMLHttpRequest',
    );
    expect(modifiedConfig.headers.get('content-type')).toBe('application/json');
    expect(modifiedConfig.data).toEqual({});
  });

  it('does not modify headers for non-POST requests in useCsrfRequestHook', () => {
    const config = { method: 'GET', headers: new Map(), data: undefined };
    const defaultConfig = getDefaultSceneConfig();

    const modifiedConfig = defaultConfig.hooks.onBeforeRequest[0](
      config as any,
    );

    expect(modifiedConfig.headers.get('content-type')).toBeUndefined();
    expect(modifiedConfig.data).toBeUndefined();
  });

  it('returns undefined for a non-existent scene', () => {
    const config = getDefaultSceneConfig();
    const scene = config.scenes['non-existent-scene'];

    expect(scene).toBeUndefined();
  });

  it('returns the correct configuration for an existing scene', () => {
    const config = getDefaultSceneConfig();
    const scene = config.scenes[RequestScene.SendMessage];

    expect(scene).toMatchObject({
      url: '/api/conversation/chat',
      method: 'POST',
    });
  });
});
