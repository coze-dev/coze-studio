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

/* eslint-disable @coze-arch/no-deep-relative-import -- pure ui rendering  */
import { type PropsWithChildren, type ComponentProps } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconButton, Popover, Table } from '@coze-arch/bot-semi';
import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import { ReactComponent as Strikethrough } from '../../../../assets/markdown-icon/strikethrough.svg';
import { ReactComponent as Quote } from '../../../../assets/markdown-icon/quote.svg';
import { ReactComponent as NumberedList } from '../../../../assets/markdown-icon/numbered-list.svg';
import { ReactComponent as Italic } from '../../../../assets/markdown-icon/italic.svg';
import { ReactComponent as H3 } from '../../../../assets/markdown-icon/h3.svg';
import { ReactComponent as H2 } from '../../../../assets/markdown-icon/h2.svg';
import { ReactComponent as H1 } from '../../../../assets/markdown-icon/h1.svg';
import { ReactComponent as Code } from '../../../../assets/markdown-icon/code.svg';
import { ReactComponent as CodeBlock } from '../../../../assets/markdown-icon/code-block.svg';
import { ReactComponent as BulletedList } from '../../../../assets/markdown-icon/bulleted-list.svg';
import { ReactComponent as Bold } from '../../../../assets/markdown-icon/bold.svg';

import styles from './index.module.less';

export type MarkdownDescriptionPopoverProps = Pick<
  ComponentProps<typeof Popover>,
  'visible' | 'onVisibleChange'
>;

interface MarkdownDescription {
  mark: string;
  example: string;
  iconKey: string;
}

type TableProps = ComponentProps<typeof Table>;

const IconMap: Record<
  string,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  h1: props => <H1 {...props} />,
  h2: props => <H2 {...props} />,
  h3: props => <H3 {...props} />,
  bold: props => <Bold {...props} />,
  italic: props => <Italic {...props} />,
  strikethrough: props => <Strikethrough {...props} />,
  quote: props => <Quote {...props} />,
  code: props => <Code {...props} />,
  codeBlock: props => <CodeBlock {...props} />,
  numberedList: props => <NumberedList {...props} />,
  bulletedList: props => <BulletedList {...props} />,
};

const columns: Required<TableProps>['columns'] = [
  {
    title: '',
    dataIndex: 'icon',
    className: styles['cell-column'],
    onCell: () => ({
      className: styles['icon-cell'],
    }),
    render: (_, record: MarkdownDescription) => {
      const IconComponent = IconMap[record.iconKey];
      if (!IconComponent) {
        return null;
      }
      return (
        <div className={styles['icon-wrapper']}>
          <IconComponent className={styles.icon} />
        </div>
      );
    },
  },
  {
    title: '',
    dataIndex: 'mark',
    className: styles['mark-column'],
    align: 'left',
  },
  {
    title: '',
    dataIndex: 'example',
    align: 'right',
    className: styles['example-column'],
  },
];
const getData: () => MarkdownDescription[] = () => [
  {
    mark: I18n.t('markdown_heading1'),
    example: I18n.t('markdown_heading1_syntax', { space: I18n.t('space') }),
    iconKey: 'h1',
  },
  {
    mark: I18n.t('markdown_heading2'),
    example: I18n.t('markdown_heading2_syntax', { space: I18n.t('space') }),
    iconKey: 'h2',
  },
  {
    mark: I18n.t('markdown_heading3'),
    example: I18n.t('markdown_heading3_syntax', { space: I18n.t('space') }),
    iconKey: 'h3',
  },
  {
    mark: I18n.t('markdown_bold'),
    example: I18n.t('markdown_bold_syntax', {
      space: I18n.t('space'),
      text: I18n.t('text'),
    }),
    iconKey: 'bold',
  },
  {
    mark: I18n.t('markdown_italic'),
    example: I18n.t('markdown_italic_syntax', {
      space: I18n.t('space'),
      text: I18n.t('text'),
    }),
    iconKey: 'italic',
  },
  {
    mark: I18n.t('markdown_strickthrough'),
    example: I18n.t('markdown_strickthrough_syntax', {
      space: I18n.t('space'),
      text: I18n.t('text'),
    }),
    iconKey: 'strikethrough',
  },
  {
    mark: I18n.t('markdown_quote'),
    example: I18n.t('markdown_quote_syntax', { space: I18n.t('space') }),
    iconKey: 'quote',
  },
  {
    mark: I18n.t('markdown_code'),
    example: I18n.t('markdown_code_syntax', {
      space: I18n.t('space'),
      code: I18n.t('code'),
    }),
    iconKey: 'code',
  },
  {
    mark: I18n.t('markdown_codeblock'),
    example: I18n.t('markdown_codeblock_syntax', {
      space: I18n.t('space'),
    }),
    iconKey: 'codeBlock',
  },
  {
    mark: I18n.t('markdown_numberedlist'),
    example: I18n.t('markdown_numberedlist_syntax', { space: I18n.t('space') }),
    iconKey: 'numberedList',
  },
  {
    mark: I18n.t('markdown_bulletedlist'),
    example: I18n.t('markdown_bulletedlist_syntax', { space: I18n.t('space') }),
    iconKey: 'bulletedList',
  },
];

export const MarkdownDescriptionPopover: React.FC<
  PropsWithChildren<MarkdownDescriptionPopoverProps>
> = ({ children, visible, onVisibleChange }) => (
  <Popover
    trigger="custom"
    visible={visible}
    showArrow
    position="rightTop"
    content={
      <div className={styles.content}>
        <div className={styles.title}>
          <div>Markdown</div>
          <IconButton
            size="small"
            theme="borderless"
            icon={<IconCloseNoCycle />}
            onClick={() => onVisibleChange?.(false)}
          />
        </div>
        <div className={styles.description}>{I18n.t('markdown_intro')}</div>
        <Table
          className={styles.table}
          showHeader={false}
          columns={columns}
          dataSource={getData()}
          pagination={false}
          size="small"
          onRow={() => ({
            className: styles.row,
          })}
        />
      </div>
    }
  >
    {children}
  </Popover>
);
