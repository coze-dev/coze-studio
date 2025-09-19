export const request = (url, params?: {}, method?: string) =>
  fetch(url, {
    method: method || 'POST',
    headers:
      method !== 'GET'
        ? {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
            'x-requested-with': 'XMLHttpRequest',
          }
        : undefined,
    body: method !== 'GET' ? JSON.stringify(params) : undefined,
  })
    .then(res => res.json())
    .then(res => {
      if (typeof res.code === 'number' && res.code !== 0) {
        throw new Error(res.msg);
      } else {
        return res;
      }
    });

export const getRowsCount = (itemHeight, minSize = 20) => {
  let pageSize = document.documentElement.clientHeight / itemHeight;
  pageSize = Math.max(pageSize, minSize);

  return pageSize;
};
