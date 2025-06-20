import { type Editor } from '@tiptap/react';

/**
 * 获取编辑器内容
 */
export const getEditorContent = (editor: Editor | null) => {
  if (!editor) {
    return '';
  }
  const rawContent = editor.isEmpty ? '' : editor.getHTML();
  // 处理编辑器输出内容，移除不必要的<p>标签
  const newContent = removeEditorWrapperParagraph(rawContent);
  return newContent;
};

/**
 * 处理编辑器输出的HTML内容
 * 移除不必要的外层<p>标签，保持与原始内容格式一致
 */
export const removeEditorWrapperParagraph = (content: string): string => {
  if (!content) {
    return '';
  }

  // 如果内容被<p>标签包裹，并且只有一个<p>标签
  const singleParagraphMatch = content.match(/^<p>(.*?)<\/p>$/s);
  if (singleParagraphMatch) {
    return singleParagraphMatch[1];
  }

  return content;
};
