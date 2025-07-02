import type { CommentEditorBlock } from '../../type';
import { getCozeCom, getCozeCn } from './util';

export const commentEditorMockBlocks = [
  {
    type: 'heading-one',
    children: [
      {
        text: 'Workflow Comment',
        bold: true,
        underline: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '[Format]',
        bold: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Bold',
        bold: true,
        type: 'text',
      },
      {
        text: ' ',
        type: 'text',
      },
      {
        text: 'Italic',
        italic: true,
        type: 'text',
      },
      {
        text: ' ',
        type: 'text',
      },
      {
        text: 'Underline',
        underline: true,
        type: 'text',
      },
      {
        text: ' ',
        type: 'text',
      },
      {
        text: 'Strikethrough',
        strikethrough: true,
        type: 'text',
      },
      {
        text: ' ',
        type: 'text',
      },
      {
        strikethrough: true,
        text: 'Mixed',
        bold: true,
        italic: true,
        underline: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '[Quote]',
        bold: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [
      {
        type: 'text',
        text: 'This line should be displayed as a quote.',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [
      {
        type: 'text',
        text: 'Line 2: content.',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [
      {
        type: 'text',
        text: 'Line 3: content.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '[Bullet List]',
        bold: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'bulleted-list',
    children: [
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 1',
            type: 'text',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 2',
            type: 'text',
          },
        ],
      },
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: 'item order 2.1',
                type: 'text',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'item order 2.2',
                type: 'text',
              },
            ],
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 3',
            type: 'text',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '[Numbered List]',
        bold: true,
        type: 'text',
      },
    ],
  },
  {
    type: 'numbered-list',
    children: [
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 1',
            type: 'text',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 2',
            type: 'text',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'item order 3',
            type: 'text',
          },
        ],
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        bold: true,
        text: '[Hyper Link]',
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Coze 👉🏻 ',
        type: 'text',
      },
      {
        link: getCozeCom(),
        text: 'coze.com',
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Coze for CN 👉🏻 ',
        type: 'text',
      },
      {
        text: 'coze.cn',
        link: getCozeCn(),
        type: 'text',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        bold: true,
        text: '[Heading]',
        type: 'text',
      },
    ],
  },
  {
    type: 'heading-one',
    children: [
      {
        text: 'Heading 1',
        type: 'text',
      },
    ],
  },
  {
    type: 'heading-two',
    children: [
      {
        text: 'Heading 2',
        type: 'text',
      },
    ],
  },
  {
    type: 'heading-three',
    children: [
      {
        text: 'Heading 3',
        type: 'text',
      },
    ],
  },
  {
    type: 'heading-three',
    children: [
      {
        text: 'Heading Formatted',
        bold: true,
        italic: true,
        underline: true,
        type: 'text',
      },
    ],
  },
] as CommentEditorBlock[];
