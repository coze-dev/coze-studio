const DOMAIN_REGEXP = /^([0-9a-zA-Z-]{1,}\.)+([a-zA-Z]{2,})$/;

export function isValidUrl(url: string): boolean {
  try {
    // cp-disable-next-line
    const urlObject = new URL(`https://${url}`);
    return DOMAIN_REGEXP.test(urlObject.hostname);
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- 根据函数功能无需 throw error
  } catch {
    return false;
  }
}

// cp-disable-next-line
export const getUrlValue = (url: string) => url?.replace(/^https:\/\//, '');
