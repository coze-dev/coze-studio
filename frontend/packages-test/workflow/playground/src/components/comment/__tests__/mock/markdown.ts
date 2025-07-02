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
