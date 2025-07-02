import { shouldCloseConsole } from '../src/console-disable';

describe('shouldCloseConsole', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test('URL search can control the result', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => false,
      setItem: vi.fn(),
    });
    vi.stubGlobal('IS_RELEASE_VERSION', true);
    vi.stubGlobal('IS_PROD', true);

    vi.stubGlobal('window', {
      location: { search: '' },
      gfdatav1: {
        canary: 0,
      },
    });
    expect(shouldCloseConsole()).equal(true);
    vi.stubGlobal('window', { location: { search: '?open_debug=true' } });
    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('window', {
      location: { search: '?test=a&open_debug=true' },
    });
    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('sessionStorage', {
      getItem: () => true,
      setItem: vi.fn(),
    });
    vi.stubGlobal('window', { location: { search: '' } });
    expect(shouldCloseConsole()).equal(false);
  });

  test('Production mode should return true', () => {
    vi.stubGlobal('IS_PROD', true);
    vi.stubGlobal('window', {
      location: { search: '?test=a' },
      gfdatav1: {
        canary: 0,
      },
    });
    vi.stubGlobal('IS_RELEASE_VERSION', false);
    expect(shouldCloseConsole()).equal(false);

    vi.stubGlobal('IS_RELEASE_VERSION', true);
    expect(shouldCloseConsole()).equal(true);

    vi.stubGlobal('IS_RELEASE_VERSION', false);

    expect(shouldCloseConsole()).equal(false);
    vi.stubGlobal('window', {
      location: { search: '?test=a&&open_debug=true' },
      gfdatav1: {
        canary: 0,
      },
    });
    vi.stubGlobal('IS_RELEASE_VERSION', true);

    expect(shouldCloseConsole()).equal(false);
  });
});
