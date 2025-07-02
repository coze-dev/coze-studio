export const isWebpackChunkError = (error: Error) =>
  error.name === 'ChunkLoadError';

// Loading chunk 3 failed. (error: )
export const isThirdPartyJsChunkError = (error: Error & { type?: string }) =>
  error.message?.startsWith('Loading chunk');

// Loading CSS chunk 8153 failed. ()
export const isCssChunkError = (error: Error) =>
  error.message?.startsWith('Loading CSS chunk');

export const isChunkError = (error: Error) =>
  isWebpackChunkError(error) ||
  isThirdPartyJsChunkError(error) ||
  isCssChunkError(error);
