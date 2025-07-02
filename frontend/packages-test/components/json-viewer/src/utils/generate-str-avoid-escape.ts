// 对象中的文本，避免字符被转译
export const generateStrAvoidEscape = (str: string) => {
  const characters = {
    '\\': '\\\\',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
  };

  let next = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    next += characters[char] || char;
  }

  return next;
};
