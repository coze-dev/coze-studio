export const incrementVersionNumber = (input: string) => {
  // 定义正则表达式，匹配 "数字.数字.数字" 的模式
  const regex = /(\d+)\.(\d+)\.(\d+)/g;

  // 使用 replace 方法和回调函数对匹配的部分进行替换
  // eslint-disable-next-line max-params
  const result = input.replace(regex, (_match, p1, p2, p3) => {
    // 将最后一个数字加 1
    const incrementedP3 = parseInt(String(p3), 10) + 1;
    // 返回新的字符串
    return `${p1}.${p2}.${incrementedP3}`;
  });

  return result;
};
