import { type IApplyMetadata } from '@coze-common/md-editor-adapter';

import { type EditorApplyDataSetField, type EditorApplyDataSet } from './type';
export class EditorSharedApplyRecordService {
  private editorApplyMetaDataSet: EditorApplyDataSet = {
    floatTriggerPlugin: [],
  };
  pushApplyMeta = ({
    applyMetaData,
    field,
  }: {
    applyMetaData: IApplyMetadata | undefined;
    field: EditorApplyDataSetField;
  }) => {
    this.editorApplyMetaDataSet[field].push(applyMetaData);
  };
  getApplyMetaList = ({ field }: { field: keyof EditorApplyDataSet }) =>
    this.editorApplyMetaDataSet[field];
  clearField = ({ field }: { field: EditorApplyDataSetField }) => {
    this.editorApplyMetaDataSet[field] = [];
  };
}
