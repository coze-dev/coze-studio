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
