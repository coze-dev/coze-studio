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

import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowContentChangeEvent,
  type WorkflowContentChangeType,
} from '@flowgram-adapter/free-layout-editor';

type Listener = (e: WorkflowContentChangeEvent) => void;

/**
 * A hook to monitor changes in document content
 */
export const useDocumentContentChange = (
  /** Listener */
  listener: Listener,
  /** Listen type, listen to all by default */
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
