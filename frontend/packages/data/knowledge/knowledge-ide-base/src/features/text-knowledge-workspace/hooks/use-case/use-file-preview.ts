import { useState, useEffect } from 'react';

export const useFilePreview = (curDocId: string) => {
  const [showOriginalFile, setShowOriginalFile] = useState(false);

  // 切换文档时，重置预览状态
  useEffect(() => {
    if (showOriginalFile) {
      setShowOriginalFile(false);
    }
  }, [curDocId]);

  const handleToggleOriginalFile = (checked: boolean) => {
    setShowOriginalFile(checked);
  };

  return {
    showOriginalFile,
    handleToggleOriginalFile,
  };
};
