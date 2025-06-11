import {
  isWebpackChunkError,
  isThirdPartyJsChunkError,
  isCssChunkError,
  isChunkError,
} from '../src/source-error';

describe('bot-error-source-error', () => {
  test('isWebpackChunkError', () => {
    const chunkError = new Error();
    chunkError.name = 'ChunkLoadError';
    expect(isWebpackChunkError(chunkError)).toBeTruthy();
    expect(isChunkError(chunkError)).toBeTruthy();
  });

  test('isThirdPartyJsChunkError', () => {
    const loadingChunkError = new Error();
    loadingChunkError.message = 'Loading chunk xxxx';
    expect(isThirdPartyJsChunkError(loadingChunkError)).toBeTruthy();
    expect(isChunkError(loadingChunkError)).toBeTruthy();
  });

  test('isCssChunkError', () => {
    const cssLoadingChunkError = new Error();
    cssLoadingChunkError.message = 'Loading CSS chunk xxx';
    expect(isCssChunkError(cssLoadingChunkError)).toBeTruthy();
    expect(isChunkError(cssLoadingChunkError)).toBeTruthy();
  });
});
