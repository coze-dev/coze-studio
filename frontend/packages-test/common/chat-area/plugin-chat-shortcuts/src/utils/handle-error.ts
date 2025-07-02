export function isApiError(error: unknown): error is { name: 'ApiError' } {
  if (!error) {
    return false;
  }
  return (error as { name?: string }).name === 'ApiError';
}
