export { type Chunk } from './types/chunk';
export { DocumentEditor } from './features/editor';
export { DocumentPreview } from './features/preview';
export { useSaveChunk } from './hooks/use-case/use-save-chunk';
export { useInitEditor } from './hooks/use-case/use-init-editor';
export { EditorToolbar } from './features/editor-toolbar';
export { getInitEditorContent } from './services/use-case/get-init-editor-content';
export {
  LevelTextKnowledgeEditor,
  type LevelDocumentChunk,
  type LevelDocumentTree,
} from './scenes/level';
export { BaseTextKnowledgeEditor } from './scenes/base';
export type { Editor } from '@tiptap/react';

// 新增组件导出
export { HoverEditBar } from './features/hover-edit-bar/hover-edit-bar';
export {
  EditAction,
  AddBeforeAction,
  AddAfterAction,
  DeleteAction,
} from './features/hover-edit-bar-actions';

// 事件总线相关导出
export {
  eventBus,
  createEventBus,
  useEventBus,
  useEventListener,
  type EventTypes,
  type EventTypeName,
  type EventHandler,
} from './event';
