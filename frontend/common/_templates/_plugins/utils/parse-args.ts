import process from 'process';

// parseArgs.ts
export function parseCommandLineArguments() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  // 循环遍历所有参数
  for (let i = 0; i < args.length; i++) {
    // 检查当前参数是否是一个选项（以 "--" 开头）
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2); // 移除 "--" 前缀

      // 检查下一个参数是否存在，且不是另一个选项
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        result[key] = args[i + 1]; // 将下一个参数作为当前选项的值
        i++; // 跳过下一个参数，因为它已经被处理为当前选项的值
      } else {
        result[key] = ''; // 如果没有值，只设置选项的键
      }
    }
  }

  return result;
}
