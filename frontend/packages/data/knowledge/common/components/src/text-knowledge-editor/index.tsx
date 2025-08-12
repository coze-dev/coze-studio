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

export { type Chunk } from './types/chunk';
export { DocumentEditor } from './features/editor';
export { DocumentPreview } from './features/preview';
export { useSaveChunk } from './hooks/use-case/use-save-chunk';
export { useInitEditor } from './hooks/use-case/use-init-editor';
export { EditorToolbar } from './features/editor-toolbar';
export {
  LevelTextKnowledgeEditor,
  type LevelDocumentChunk,
  type LevelDocumentTree,
} from './scenes/level';
export { BaseTextKnowledgeEditor } from './scenes/base';
export type { Editor } from '@tiptap/react';

// Add component export
export { HoverEditBar } from './features/hover-edit-bar/hover-edit-bar';
export {
  EditAction,
  AddBeforeAction,
  AddAfterAction,
  DeleteAction,
} from './features/hover-edit-bar-actions';

// Event Bus Dependent Export
export {
  eventBus,
  createEventBus,
  useEventBus,
  useEventListener,
  type EventTypes,
  type EventTypeName,
  type EventHandler,
} from './event';
