export const getFileExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1);
};
