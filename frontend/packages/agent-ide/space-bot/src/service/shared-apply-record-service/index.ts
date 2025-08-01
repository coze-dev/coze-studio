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
