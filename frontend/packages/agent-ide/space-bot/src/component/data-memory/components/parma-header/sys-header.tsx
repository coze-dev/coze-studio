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

import { I18n } from '@coze-arch/i18n';

import { exhaustiveCheckSimple } from '../../utils/exhaustive-check';
import { type IHeaderItemProps, type ItemType } from './types';

export type SysItemType = ItemType;

export type ISysHeaderItem = IHeaderItemProps;

export const SysParamHeader = (props: { isReadonly: boolean }) => {
  const { isReadonly } = props;
  const sysHeaderItems = [
    getSysItemConfig('filed', isReadonly),
    getSysItemConfig('description', isReadonly),
    getSysItemConfig('default', isReadonly),
    getSysItemConfig('channel', isReadonly),
    getSysItemConfig('action', isReadonly),
  ];
  return (
    <thead>
      <tr className="flex gap-x-4 flex-nowrap">
        {sysHeaderItems.map(item =>
          item ? <th className={item.className}>{item.title}</th> : null,
        )}
      </tr>
    </thead>
  );
};

export const getSysItemConfig = (
  item: SysItemType,
  isReadonly: boolean,
): ISysHeaderItem => {
  if (item === 'filed') {
    return {
      type: 'filed',
      className: 'w-[140px] flex-none basis-[140px] coz-fg-secondary',
      title: (
        <>
          {I18n.t('bot_edit_memory_title_filed')}
          <span className="coz-fg-hglt-red">*</span>
        </>
      ),
    };
  }
  if (item === 'description') {
    return {
      type: 'description',
      className: 'w-[128px] flex-none basis-[128px] coz-fg-secondary',
      title: I18n.t('bot_edit_memory_title_description'),
    };
  }
  if (item === 'default') {
    return {
      type: 'default',
      className: 'w-[128px] flex-none basis-[128px] coz-fg-secondary',
      title: I18n.t('bot_edit_memory_title_default'),
    };
  }
  if (item === 'channel') {
    return {
      type: 'channel',
      className: 'w-[128px] flex-none basis-[128px] coz-fg-secondary',
      title: I18n.t('variable_Table_Title_support_channels'),
    };
  }
  if (item === 'action') {
    if (isReadonly) {
      return null;
    }
    return {
      type: 'action',
      className: 'w-[122px] flex-none basis-[122px] coz-fg-secondary',
      title: I18n.t('bot_edit_memory_title_action'),
    };
  }
  exhaustiveCheckSimple(item);
};
