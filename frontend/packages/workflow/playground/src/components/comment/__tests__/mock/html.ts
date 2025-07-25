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

import { getCozeCom, getCozeCn } from './util';

export const commentEditorMockHTML = `<h1><u><strong>Workflow Comment</strong></u></h1><p><strong>[Format]</strong></p><p><strong>Bold</strong> <em>Italic</em> <u>Underline</u> <del>Strikethrough</del> <del><u><em><strong>Mixed</strong></em></u></del></p><p><strong>[Quote]</strong></p><blockquote><p>This line should be displayed as a quote.</p></blockquote><blockquote><p>Line 2: content.</p></blockquote><blockquote><p>Line 3: content.</p></blockquote><p><strong>[Bullet List]</strong></p><ul><li>item order 1</li><li>item order 2</li><li>item order 3</li></ul><p><strong>[Numbered List]</strong></p><ol><li>item order 1</li><li>item order 2</li><li>item order 3</li></ol><p><strong>[Hyper Link]</strong></p><p>Coze 👉🏻 <a href="${getCozeCom()}">coze.com</a></p><p>Coze for CN 👉🏻 <a href="${getCozeCn()}">coze.cn</a></p><p><strong>[Heading]</strong></p><h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h3><u><em><strong>Heading Formatted</strong></em></u></h3>`;
