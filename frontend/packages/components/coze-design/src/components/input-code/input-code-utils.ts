export const replaceCharAt = (
  source: string,
  subString: string,
  start: number,
) => {
  const realStart = Math.max(0, start);
  const realEnd = Math.min(source.length, start + subString.length);

  return `${source.slice(0, realStart)}${subString}${source.slice(realEnd)}`;
};

// 输入内容隐藏延迟 ms
export const DELAY = 150;
