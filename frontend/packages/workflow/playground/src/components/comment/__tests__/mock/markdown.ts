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

export const commentEditorMockMarkdown = `# __**Workflow Comment**__

**[Format]**

**Bold** *Italic* __Underline__ ~~Strikethrough~~ ~~__***Mixed***__~~

**[Quote]**

> This line should be displayed as a quote.

> Line 2: content.

> Line 3: content.

**[Bullet List]**

- item order 1
- item order 2
- item order 3

**[Numbered List]**

1. item order 1
2. item order 2
3. item order 3

**[Hyper Link]**

Coze 👉🏻 [coze.com](${getCozeCom()})

Coze for CN 👉🏻 [coze.cn](${getCozeCn()})

**[Heading]**

# Heading 1

## Heading 2

### Heading 3

### __***Heading Formatted***__`;
