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

export const getEditorImgClassname = () =>
  classNames(
    '[&_img]:relative [&_img]:block',
    '[&_img]:my-3 [&_img]:bg-white [&_img]:rounded-md',
    '[&_img]:max-w-[610px] [&_img]:max-h-[367px] [&_img]:w-auto',
    '[&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-blue-500',
    '[&_img.ProseMirror-selectednode]:shadow-md',
  );
