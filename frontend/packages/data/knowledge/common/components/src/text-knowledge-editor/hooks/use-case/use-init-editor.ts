import { useEffect } from 'react';

import StarterKit from '@tiptap/starter-kit';
import { useEditor, type Editor } from '@tiptap/react';
import { type EditorProps } from '@tiptap/pm/view';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Table from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import HardBreak from '@tiptap/extension-hard-break';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import {
  getHtmlContent,
  processEditorContent,
} from '@/text-knowledge-editor/services/inner/document-editor.service';

interface UseDocumentEditorProps {
  chunk: Chunk | null;
  editorProps?: EditorProps;
  onChange?: (chunk: Chunk) => void;
}

export const useInitEditor = ({
  chunk,
  editorProps,
  onChange,
}: UseDocumentEditorProps) => {
  // 创建编辑器实例
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          // 强制换行
          keepMarks: true,
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      HardBreak,
    ],
    content: getHtmlContent(chunk?.content || ''),
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (!chunk || !editorInstance) {
        return;
      }
      const rawContent = editorInstance.isEmpty ? '' : editorInstance.getHTML();
      // 处理编辑器输出内容，移除不必要的<p>标签
      const newContent = processEditorContent(rawContent);
      onChange?.({
        ...chunk,
        content: newContent,
      });
    },
    editorProps: {
      ...editorProps,
      handlePaste(view, event, slice) {
        if (!editor) {
          return false;
        }
        const text = event.clipboardData?.getData('text/plain');

        // 如果粘贴的纯文本中包含换行符
        if (text?.includes('\n')) {
          event.preventDefault(); // 阻止默认粘贴行为

          const html = getHtmlContent(text);

          // 将转换后的 HTML 插入编辑器
          editor.chain().focus().insertContent(html).run();

          return true; // 表示我们已处理
        }

        return false; // 使用默认行为
      },
    },
  });

  // 当激活的分片改变时，更新编辑器内容
  useEffect(() => {
    if (!editor || !chunk) {
      return;
    }
    const htmlContent = getHtmlContent(chunk.content || '');
    // 设置内容，保留换行符
    editor.commands.setContent(htmlContent || '', false, {
      preserveWhitespace: 'full',
    });
  }, [chunk, editor]);

  return {
    editor,
  };
};
