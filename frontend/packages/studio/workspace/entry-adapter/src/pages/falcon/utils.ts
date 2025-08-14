export const replaceUrl = (url: string) =>
  url.replace('@minio/public-cbbiz', '/filestore/dev-public-cbbiz');

export const parseUrl = (url: string) =>
  url.replace('/filestore/dev-public-cbbiz', '@minio/public-cbbiz');

export const installTypeOptions = [
  {
    label: 'npx',
    value: 'npx',
  },
  {
    label: 'uvx',
    value: 'uvx',
  },
  {
    label: 'sse',
    value: 'sse',
  },
];
