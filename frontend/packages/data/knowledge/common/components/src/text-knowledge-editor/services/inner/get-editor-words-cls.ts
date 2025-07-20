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
 
import classNames from 'classnames';

export const getEditorWordsCls = () =>
  classNames(
    // 换行
    '[&_p]:break-words [&_p]:whitespace-pre-wrap',
    // 保留所有空格和换行符
    '[&_.ProseMirror_*]:break-words [&_.ProseMirror_*]:whitespace-pre-wrap',
    // 段落
    '[&_.editor-paragraph]:min-h-[1.5em] [&_.editor-paragraph]:leading-normal',
    // 空段落
    '[&_.editor-paragraph:empty]:min-h-[1.5em] [&_.editor-paragraph:empty]:block',
  );
