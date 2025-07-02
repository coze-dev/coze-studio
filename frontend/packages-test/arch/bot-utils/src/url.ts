import queryString from 'query-string';

import { getIsMobile, getIsSafari } from './platform';

export const getParamsFromQuery = (params: { key: string }) => {
  const { key = '' } = params;
  const queryParams = queryString.parse(location.search);
  return (queryParams?.[key] ?? '') as string;
};
export function appendUrlParam(
  url: string,
  key: string,
  value: string | string[] | null | undefined,
) {
  const urlInfo = queryString.parseUrl(url);
  if (!value) {
    delete urlInfo.query[key];
  } else {
    urlInfo.query[key] = value;
  }
  return queryString.stringifyUrl(urlInfo);
}

export function openUrl(url?: string) {
  if (!url) {
    return;
  }
  if (getIsMobile() && getIsSafari()) {
    location.href = url;
  } else {
    window.open(url, '_blank');
  }
}
