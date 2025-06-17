import { useEffect } from 'react';

export interface UseOutEditorModeProps {
  editorRef: React.RefObject<HTMLDivElement>;
  exclude?: React.RefObject<HTMLDivElement>[];
  onExitEditMode?: () => void;
}

export const useOutEditorMode = ({
  editorRef,
  exclude,
  onExitEditMode,
}: UseOutEditorModeProps) => {
  // 处理点击文档其他位置
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的是编辑器外部，则退出编辑模式
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        !exclude?.some(ref => ref.current?.contains(event.target as Node))
      ) {
        onExitEditMode?.();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editorRef, exclude, onExitEditMode]);
};
