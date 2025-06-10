export const prefixUri = (uri: string, url: string) => {
  const [filePrefix] = uri.split('/');
  const urlArray = url.split('/');
  const filePrefixIndex = urlArray.findIndex(text => text === filePrefix);
  const tosRegion = urlArray[filePrefixIndex - 1];
  const processedUri = `${tosRegion}/${uri}`;

  return processedUri;
};
