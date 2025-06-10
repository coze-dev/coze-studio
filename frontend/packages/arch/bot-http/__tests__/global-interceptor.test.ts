import MockAdapter from 'axios-mock-adapter';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    persist: {
      error: vi.fn(),
    },
  },
}));

vi.mock('../src/eventbus', () => ({
  emitAPIErrorEvent: vi.fn(),
  APIErrorEvent: {
    UNAUTHORIZED: 'unauthorized',
    COUNTRY_RESTRICTED: 'countryRestricted',
    COZE_TOKEN_INSUFFICIENT: 'cozeTokenInsufficient',
  },
}));
vi.mock('../src/api-error', async () => {
  const actual = (await vi.importActual('../src/api-error')) as any;

  return {
    ...actual,
    reportHttpError: vi.fn(),
  };
});

vi.mock('@coze-arch/web-context', () => ({
  redirect: vi.fn(),
}));

describe('globalRequestInterceptor', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should run intercept logic', async () => {
    const { addGlobalRequestInterceptor, axiosInstance } =
      await vi.importActual('../src/axios');
    // This sets the mock adapter on the default instance
    const mock = new MockAdapter(axiosInstance);

    addGlobalRequestInterceptor(config => {
      config.headers.set('x-tt-foo', 'bar');
      return config;
    });

    mock.onGet('/users').reply(200, {
      code: 0,
      data: { users: [{ id: 1, name: 'John Smith' }] },
    });

    const response = await axiosInstance.get('/users');

    expect(response.config.headers['x-tt-foo']).toEqual('bar');
  });

  it('run extra interceptor logic', async () => {
    const { addGlobalResponseInterceptor, axiosInstance } =
      await vi.importActual('../src/axios');
    const mock = new MockAdapter(axiosInstance);
    const removeInterceptor = addGlobalResponseInterceptor(obj => {
      obj.data.data.oh = 2;
      return obj;
    });

    mock.onGet('/oh').reply(200, {
      code: 0,
      data: { oh: 1 },
    });
    const response = await axiosInstance.get('/oh');
    expect(response.data.data.oh).toBe(2);

    removeInterceptor();
    const response2 = await axiosInstance.get('/oh');
    expect(response2.data.data.oh).toBe(1);
  });

  it('should support remove interceptors', async () => {
    const {
      addGlobalRequestInterceptor,
      removeGlobalRequestInterceptor,
      axiosInstance,
    } = await vi.importActual('../src/axios');
    // This sets the mock adapter on the default instance

    const mock = new MockAdapter(axiosInstance);
    const id = addGlobalRequestInterceptor(config => {
      config.headers.set('x-tt-foo', 'bar');
      console.log('wfe', 'wefe');
      return config;
    });
    removeGlobalRequestInterceptor(id);

    mock.onGet('/users').reply(200, {
      code: 0,
      data: { users: [{ id: 1, name: 'John Smith' }] },
    });

    const response = await axiosInstance.get('/users');

    expect(response.config.headers['x-tt-foo']).toBeUndefined();
  });
});
