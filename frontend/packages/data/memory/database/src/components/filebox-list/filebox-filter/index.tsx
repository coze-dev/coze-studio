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
