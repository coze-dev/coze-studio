import { I18n } from '@coze-arch/i18n';

import { exhaustiveCheckSimple } from '../../utils/exhaustive-check';
import { type IHeaderItemProps, type ItemType } from './types';

export type UserItemType = Exclude<ItemType, 'channel'>;

export type IUserHeaderItem = IHeaderItemProps;

export const UserParamHeader = (props: { isReadonly: boolean }) => {
  const { isReadonly } = props;
  const userHeaderItems = [
    getUserItemConfig('filed', isReadonly),
    getUserItemConfig('description', isReadonly),
    getUserItemConfig('default', isReadonly),
    getUserItemConfig('action', isReadonly),
  ];
  return (
    <thead>
      <tr className="flex gap-x-4 flex-nowrap">
        {userHeaderItems.map(item =>
          item ? <th className={item.className}>{item.title}</th> : null,
        )}
      </tr>
    </thead>
  );
};

export const getUserItemConfig = (
  item: UserItemType,
  isReadonly: boolean,
): IUserHeaderItem => {
  if (item === 'filed') {
    return {
      type: 'filed',
      className: 'flex-1 coz-fg-secondary',
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
      className: 'flex-1 coz-fg-secondary',
      title: I18n.t('bot_edit_memory_title_description'),
    };
  }
  if (item === 'default') {
    return {
      type: 'default',
      className: 'w-[164px] flex-none basis-[164px] coz-fg-secondary',
      title: I18n.t('bot_edit_memory_title_default'),
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
