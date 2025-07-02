const DOMAIN_REGEXP = /^([0-9a-zA-Z-]{1,}\.)+([a-zA-Z]{2,})$/;

export function isValidUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    return (
      DOMAIN_REGEXP.test(urlObject.hostname) &&
      // cp-disable-next-line
      (url.indexOf('https://') !== -1 || url.indexOf('http://') !== -1)
    );
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- 根据函数功能无需 throw error
  } catch {
    return false;
  }
}

export function completeUrl(url: string): string {
  let newUrl = url.trim();

  if (!newUrl.includes('://')) {
    // cp-disable-next-line
    newUrl = `http://${newUrl}`;
  }

  return newUrl;
}
