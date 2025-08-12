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

import React from 'react';

import { VoiceAdapter } from './voice-adapter';
import { type BaseFileProps, type FileProps } from './types';
import { TypedFileInput } from './typed-file-input';
import { FileBaseAdapter } from './base-adapter';

/** This component is still used in the setter. It will not be deleted for the time being. It will be deleted after the dependency is lifted in the future. */
export const FileAdapter: React.FC<FileProps> = props => {
  if (props.fileType === 'voice') {
    return <VoiceAdapter {...props} />;
  }

  if (props?.enableInputURL) {
    return <TypedFileInput {...(props as BaseFileProps)} />;
  }

  return <FileBaseAdapter {...(props as BaseFileProps)} />;
};
