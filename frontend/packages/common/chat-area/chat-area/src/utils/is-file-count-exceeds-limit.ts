export const isFileCountExceedsLimit = ({
  fileCount,
  fileLimit,
  existingFileCount,
}: {
  fileCount: number;
  fileLimit: number;
  existingFileCount: number;
}): boolean => {
  const remainingCount = fileLimit - existingFileCount;
  return fileCount > remainingCount;
};
