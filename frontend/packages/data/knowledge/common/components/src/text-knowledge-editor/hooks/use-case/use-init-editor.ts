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
  // Create an editor instance
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: {
          // force wrap
          keepMarks: false,
        },
        paragraph: {
          // Configure paragraphs to avoid generating extra empty paragraphs
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

        // If the pasted plain text contains a newline character
        if (text?.includes('\n')) {
          event.preventDefault(); // Block default paste behavior

          const html = getRenderHtmlContent(text);

          // Insert the converted HTML into the editor
          editor.chain().focus().insertContent(html).run();

          return true; // It means we have dealt with it.
        }

        return false; // Use default behavior
      },
    },
  });

  // Update editor content when active sharding changes
  useEffect(() => {
    if (!editor || !chunk) {
      return;
    }
    const htmlContent = getRenderHtmlContent(chunk.content || '');
    // Set content, keep newlines
    editor.commands.setContent(htmlContent || '', false, {
      preserveWhitespace: 'full',
    });
  }, [chunk, editor]);

  return {
    editor,
  };
};
