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

import {
  getFileExtension,
  getInitialPluginMetaInfo,
  isValidURL,
} from '../src/component/file-import/utils';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    persist: {
      error: vi.fn(),
    },
  },
}));

vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(),
}));

vi.mock('@coze-arch/bot-utils', () => ({
  safeJSONParse: JSON.parse,
}));

describe('getFileExtension', () => {
  it('yaml file extension', () => {
    const res = getFileExtension('test.yaml');
    expect(res).toEqual('yaml');
  });

  it('json file extension', () => {
    const res = getFileExtension('test.json');
    expect(res).toEqual('json');
  });
});

describe('isValidURL', () => {
  it('is not valid url', () => {
    const res = isValidURL('app//ddd');
    expect(res).toEqual(false);
  });

  it('is valid url', () => {
    const res = isValidURL('https://www.coze.com/hello');
    expect(res).toEqual(true);
  });
});

describe('getInitialPluginMetaInfo', () => {
  it('get initial info', () => {
    const data: any = {
      aiPlugin: {
        name_for_human: '1',
        description_for_human: '1',
        auth: { type: 'none' },
      },
      openAPI: { servers: [{ url: 'url' }] },
    };
    const res = getInitialPluginMetaInfo(data);
    expect(res.name).toEqual('1');
    expect(res.desc).toEqual('1');
    expect(res.auth_type?.[0]).toEqual(0);
    expect(res.url).toEqual('url');
  });
});
