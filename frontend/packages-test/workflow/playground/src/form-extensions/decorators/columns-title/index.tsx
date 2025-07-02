import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ColumnsTitle } from '../../components/columns-title';

import styles from './index.module.less';

const COLUMNS = [
  {
    title: I18n.t('workflow_detail_node_parameter_name'),
    style: {
      width: 160,
    },
  },
  {
    title: I18n.t('workflow_detail_node_parameter_value'),
    style: {
      width: 160,
    },
  },
];

type ColumnsTitleProps = DecoratorComponentProps<{
  columns?: Array<{
    title: string;
    style: Record<string, unknown>;
  }>;
}>;

const ColumnsTitleDecorator = ({ options, children }: ColumnsTitleProps) => {
  const { columns } = options;
  return (
    <div className={styles['column-title-dec-wrapper']}>
      <ColumnsTitle columns={columns || COLUMNS} />
      {children}
    </div>
  );
};

export const columnsTitle = {
  key: 'ColumnsTitle',
  component: ColumnsTitleDecorator,
};
