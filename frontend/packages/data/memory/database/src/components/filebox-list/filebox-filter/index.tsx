import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Divider } from '@coze-arch/bot-semi';

import { FileBoxListType } from '../types';
import { useFileBoxListStore } from '../store';

import s from './index.module.less';

export const FileBoxFilter: FC = () => {
  const fileListType = useFileBoxListStore(state => state.fileListType);
  const setFileListType = useFileBoxListStore(state => state.setFileListType);

  return (
    <div className={s.filter}>
      <div
        className={classNames({
          [s['filter-item-active']]: fileListType === FileBoxListType.Image,
        })}
        onClick={() => setFileListType(FileBoxListType.Image)}
      >
        {I18n.t('filebox_0002')}
      </div>
      <Divider layout="vertical" />
      <div
        className={classNames({
          [s['filter-item-active']]: fileListType === FileBoxListType.Document,
        })}
        onClick={() => setFileListType(FileBoxListType.Document)}
      >
        {I18n.t('filebox_0003')}
      </div>
    </div>
  );
};
