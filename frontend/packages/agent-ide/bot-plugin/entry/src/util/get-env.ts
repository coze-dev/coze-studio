export function getEnv(): string {
  if (!IS_PROD) {
    return 'cn-boe';
  }

  const regionPart = IS_OVERSEA ? 'oversea' : 'cn';
  const inhousePart = IS_RELEASE_VERSION ? 'release' : 'inhouse';
  return [regionPart, inhousePart].join('-');
}
