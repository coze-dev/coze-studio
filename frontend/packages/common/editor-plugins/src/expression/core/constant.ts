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

export enum ExpressionEditorEvent {
  Change = 'change',
  Select = 'select',
  Dispose = 'dispose',
  CompositionStart = 'compositionStart',
}

export enum ExpressionEditorToken {
  Start = '{',
  End = '}',
  FullStart = '{{',
  FullEnd = '}}',
  Separator = '.',
  ArrayStart = '[',
  ArrayEnd = ']',
}

export enum ExpressionEditorSegmentType {
  ObjectKey = 'object_key',
  ArrayIndex = 'array_index',
  EndEmpty = 'end_empty',
}

export enum ExpressionEditorSignal {
  Line = 'paragraph',
  Valid = 'valid',
  Invalid = 'invalid',
  SelectedValid = 'selectedValid',
  SelectedInvalid = 'selectedInvalid',
}
