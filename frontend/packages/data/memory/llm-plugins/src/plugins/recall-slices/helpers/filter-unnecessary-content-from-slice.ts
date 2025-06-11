export const filterUnnecessaryContentFromSlice = (slice: string): string => {
  let res = slice;
  // 过滤img 标签
  res = res.replaceAll(/<(\n)*img((?!(<(\n)*img))(.|\n))*>/g, '');
  return res;
};
