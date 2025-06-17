import { type FC } from 'react';

import dayjs from 'dayjs';
import { getTypeIcon } from '@coze-data/knowledge-resource-processor-base';
import { I18n } from '@coze-arch/i18n';
import { Typography, UITable } from '@coze-arch/bot-semi';
import { type FileVO } from '@coze-arch/bot-api/filebox';
import { type ColumnProps } from '@coze-arch/coze-design';

import { type FileBoxListProps, FileBoxListType } from '../types';
import { type Result } from '../hooks/use-file-list';
import { formatSize } from '../helpers/format-size';
import { ActionButtons } from '../action-buttons';

import s from './index.module.less';

export interface DocumentListProps extends FileBoxListProps {
  botId: string;
  documents: FileVO[];
  reloadAsync: () => Promise<Result>;
}
export const DocumentList: FC<DocumentListProps> = props => {
  const { documents, reloadAsync, botId, useBotStore, isStore, onCancel } =
    props;

  const columns: ColumnProps<FileVO>[] = [
    {
      title: I18n.t('filebox_0018'),
      dataIndex: 'name',
      render: (_, record) => {
        const { Format: format, MainURL: url, FileName: name } = record;
        return (
          <div className={s['column-document-name']}>
            {getTypeIcon({
              type: format,
              url,
              inModal: true,
            })}
            <Typography.Text
              ellipsis={{
                showTooltip: true,
              }}
            >
              {name || I18n.t('filebox_0047')}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: I18n.t('datasets_unit_upload_field_size'),
      dataIndex: 'FileSize',
      render: text => (
        <div className={s['column-document-size']}>
          {formatSize(Number(text))}
        </div>
      ),
    },
    {
      title: I18n.t('filebox_0020'),
      dataIndex: 'UpdateTime',
      render: text => (
        <div className={s['column-document-update-time']}>
          {dayjs.unix(Number(text)).format('YYYY-MM-DD HH:mm')}
        </div>
      ),
    },
    {
      title: I18n.t('Actions'),
      dataIndex: 'action',
      width: 120,
      render: (_, record) => (
        <ActionButtons
          record={record}
          reloadAsync={reloadAsync}
          type={FileBoxListType.Document}
          spaceProps={{
            spacing: 8,
          }}
          botId={botId}
          useBotStore={useBotStore}
          isStore={isStore}
          onCancel={onCancel}
        />
      ),
    },
  ];

  return (
    <UITable
      tableProps={{
        dataSource: documents,
        sticky: true,
        columns,
        rowKey: 'id',
        onRow: (record, index) => ({
          onClick: () => {
            window.open(record.MainURL);
          },
        }),
        className: s.table,
      }}
    />
  );
};
