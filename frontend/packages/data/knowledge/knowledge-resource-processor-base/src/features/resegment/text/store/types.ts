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

import {
  type TextCustomResegmentAction,
  type TextCustomResegmentState,
  type LocalTextCustomResegmentAction,
  type LocalTextCustomResegmentState,
  type UploadTextState,
  type UploadTextStore,
} from '@/features/knowledge-type/text/index';

import { type TextResegmentStep } from '../constants';

export type UploadTextResegmentState = UploadTextState<TextResegmentStep> &
  LocalTextCustomResegmentState &
  TextCustomResegmentState;

export type UploadTextResegmentStore = UploadTextStore<TextResegmentStep> &
  LocalTextCustomResegmentState &
  LocalTextCustomResegmentAction &
  TextCustomResegmentState &
  TextCustomResegmentAction;
