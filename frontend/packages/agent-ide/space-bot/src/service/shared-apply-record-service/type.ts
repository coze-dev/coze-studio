import { type IApplyMetadata } from '@coze-common/md-editor-adapter';

export interface EditorApplyDataSet {
  floatTriggerPlugin: (IApplyMetadata | undefined)[];
}
export type EditorApplyDataSetField = keyof EditorApplyDataSet;
