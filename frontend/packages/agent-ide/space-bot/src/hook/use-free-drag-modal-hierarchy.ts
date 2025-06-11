import { useEffect, type RefObject } from 'react';

import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { useBotEditorService } from '../context/bot-editor-service';

export const useFreeDragModalHierarchy = ({
  key,
  ref,
}: {
  key: string;
  ref: RefObject<HTMLDivElement>;
}) => {
  const { freeGrabModalHierarchyService } = useBotEditorService();
  const {
    storeSet: { useFreeGrabModalHierarchyStore },
  } = useBotEditor();

  const zIndex = useFreeGrabModalHierarchyStore(state =>
    freeGrabModalHierarchyService.getModalZIndex(state.getModalIndex(key)),
  );

  useEffect(() => {
    freeGrabModalHierarchyService.registerModal(key);
    const target = ref.current;
    if (!target) {
      return;
    }
    const onFocus = () => {
      freeGrabModalHierarchyService.onFocus(key);
    };

    target.addEventListener('focus', onFocus);

    return () => {
      freeGrabModalHierarchyService.removeModal(key);
      target.removeEventListener('focus', onFocus);
    };
  }, [key]);

  return zIndex;
};
