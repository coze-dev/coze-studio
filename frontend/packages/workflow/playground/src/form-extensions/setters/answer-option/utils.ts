const ASCII_CODE_A = 65; // 字母A对应的ASCII序号

export function convertNumberToLetters(n) {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + ASCII_CODE_A) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export const calcPortId = (index: number) => `branch_${index}`;
