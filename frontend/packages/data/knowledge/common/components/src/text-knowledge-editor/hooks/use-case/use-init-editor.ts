/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { useEffect } from 'react';

import StarterKit from '@tiptap/starter-kit';
import { useEditor, type Editor } from '@tiptap/react';
import { type EditorProps } from '@tiptap/pm/view';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Table from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { getRenderHtmlContent } from '@/text-knowledge-editor/services/use-case/get-render-editor-content';
import { getEditorContent } from '@/text-knowledge-editor/services/use-case/get-editor-content';

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
          keepMarks: false,
        },
        paragraph: {
          // 配置段落，避免生成多余的空段落
          HTMLAttributes: {
            class: 'text-knowledge-tiptap-editor-paragraph',
          },
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
    ],
    content: getRenderHtmlContent(chunk?.content || ''),
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (!chunk || !editorInstance) {
        return;
      }
      const newContent = getEditorContent(editorInstance);
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

          const html = getRenderHtmlContent(text);

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
    const htmlContent = getRenderHtmlContent(chunk.content || '');
    // 设置内容，保留换行符
    editor.commands.setContent(htmlContent || '', false, {
      preserveWhitespace: 'full',
    });
  }, [chunk, editor]);

  return {
    editor,
  };
};
