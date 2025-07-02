// TODO: https://github.com/web-infra-dev/rsbuild/issues/91
export const retryImport = <T>(
  importFunction: () => Promise<T>,
  maxRetryCount = 3,
) => {
  let maxCount = 0;
  const loadWithRetry = (): Promise<T> =>
    new Promise((resolve, reject) => {
      importFunction().then(
        res => resolve(res),
        error => {
          if (maxCount >= maxRetryCount) {
            reject(error);
          } else {
            maxCount++;
            resolve(loadWithRetry());
          }
        },
      );
    });
  return loadWithRetry();
};
