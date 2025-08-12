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

export interface InsertImageAction {
  type: 'image';
  sync: false;
  payload: {
    file: File;
  };
}

export interface InsertLinkAction {
  type: 'link';
  sync: true;
  payload: {
    text: string;
    link: string;
  };
}

export interface InsertVariableAction {
  type: 'variable';
  sync: true;
  payload: {
    variableTemplate: string;
  };
}

export type SyncAction = InsertLinkAction | InsertVariableAction;

export type AsyncAction = InsertImageAction;

export type TriggerAction = SyncAction | AsyncAction;

export interface UploadState {
  percent: number;
  fileName: string;
}
