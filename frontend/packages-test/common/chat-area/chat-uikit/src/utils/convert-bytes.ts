export const convertBytes = (bytes: number, decimals = 2) => {
  if (!bytes) {
    return '0 Byte';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const digit = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${digit} ${sizes[i]}`;
};
