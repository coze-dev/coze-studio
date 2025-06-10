export const defaultEnable = (value?: boolean) => {
  if (typeof value === 'undefined') {
    return true;
  }
  return value;
};
