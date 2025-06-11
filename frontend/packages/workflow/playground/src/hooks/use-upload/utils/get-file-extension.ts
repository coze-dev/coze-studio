/** 获取文件名后缀 */
export function getFileExtension(name?: string) {
  if (!name) {
    return '';
  }
  const index = name.lastIndexOf('.');
  return name.slice(index + 1).toLowerCase();
}
