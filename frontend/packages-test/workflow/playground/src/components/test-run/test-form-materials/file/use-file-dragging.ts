import { useRef, useState } from 'react';

import { useMutationObserver } from 'ahooks';

export const useFileDragging = () => {
  const [fileDragging, setFileDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useMutationObserver(
    mutationsList => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class' &&
          (mutation.target as HTMLDivElement)?.className?.includes(
            'semi-upload-drag-area',
          )
        ) {
          setFileDragging(
            (mutation.target as HTMLDivElement)?.className?.includes(
              'semi-upload-drag-area-legal',
            ),
          );
        }
      }
    },
    ref,
    { attributes: true, subtree: true, attributeFilter: ['class'] },
  );

  return {
    ref,
    fileDragging,
  };
};
