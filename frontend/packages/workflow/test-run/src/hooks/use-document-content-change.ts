import { useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowContentChangeEvent,
  type WorkflowContentChangeType,
} from '@flowgram-adapter/free-layout-editor';

type Listener = (e: WorkflowContentChangeEvent) => void;

/**
 * 监听 document content 变动的 hook
 */
export const useDocumentContentChange = (
  /** 监听器 */
  listener: Listener,
  /** 监听类型，默认监听所有 */
  listenType?: WorkflowContentChangeType,
) => {
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  useEffect(() => {
    const disposable = workflowDocument.onContentChange(e => {
      if (!listenType || listenType === e.type) {
        listener(e);
      }
    });

    return () => disposable.dispose();
  }, [workflowDocument, listener, listenType]);
};
