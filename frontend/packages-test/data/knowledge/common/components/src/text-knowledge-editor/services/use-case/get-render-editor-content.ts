import { escapeHtml } from '@/text-knowledge-editor/utils/escape-html';

/**
 * 获取渲染后的HTML内容
 */
export const getRenderHtmlContent = (content: string) => {
  if (content === '') {
    return '';
  }

  // 转义HTML，只允许白名单中的标签
  const htmlContent = escapeHtml(content);

  // 编辑器对/n不会换行，所以需要转换为<br />标签
  return htmlContent.replace(/\n/g, '<br />');
};
