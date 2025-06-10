export const TEST_RUN_FILE_NAME_KEY = 'x-wf-file_name';
export const TEST_RUN_FILE_UPLOADING_KEY = 'x-wf-file_uploading';

export const generateFileInfo = (formatUrl: string) => {
  const url = new URL(formatUrl);
  const params = new URLSearchParams(url.search);
  const fileName = params.get(TEST_RUN_FILE_NAME_KEY) ?? '';
  const uploading = params.get(TEST_RUN_FILE_UPLOADING_KEY);

  return {
    url: formatUrl,
    name: fileName,
    uploading,
  };
};
export const generateUrlWithFilename = (url: string, name?: string) => {
  if (!name || !url) {
    return url;
  }
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (params.has(TEST_RUN_FILE_NAME_KEY)) {
      params.set(TEST_RUN_FILE_NAME_KEY, name);
    } else {
      params.append(TEST_RUN_FILE_NAME_KEY, name);
    }

    urlObj.search = params.toString();

    return urlObj.toString();
  } catch (e) {
    return url;
  }
};
