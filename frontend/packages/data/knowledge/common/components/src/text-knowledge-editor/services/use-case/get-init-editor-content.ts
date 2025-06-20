/**
 * 编辑器对/n不会换行，所以需要转换为<br />标签
 */
export const getInitEditorContent = (content: string) => {
  if (content === '') {
    return '';
  }
  if (!content.includes('\n')) {
    return content;
  }
  return content.replace(/\n/g, '<br />');
};
