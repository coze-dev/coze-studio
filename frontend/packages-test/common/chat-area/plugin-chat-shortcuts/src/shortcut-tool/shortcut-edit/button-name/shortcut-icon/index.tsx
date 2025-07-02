import { type FC, useEffect, useState } from 'react';

import cls from 'classnames';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import { Popover, withField } from '@coze-arch/bot-semi';
import { type FileInfo } from '@coze-arch/bot-api/playground_api';

import DefaultIcon from '../../../../assets/shortcut-icon-default.svg';
import { useGetIconList } from './use-get-icon-list';
import { IconList, AnimateLoading, IconListField } from './icon-list';
import { Icon } from './icon';

export interface ShortcutIconProps {
  iconInfo?: FileInfo;
  onChange?: (iconInfo: FileInfo | undefined) => void;
  onLoadList?: (list: FileInfo[]) => void;
}

const DefaultIconInfo = {
  url: DefaultIcon,
};
export const ShortcutIcon: FC<ShortcutIconProps> = props => {
  const { iconInfo: initIconInfo, onChange, onLoadList } = props;
  const [iconListVisible, setIconListVisible] = useState(false);
  const { iconList, loading, error } = useGetIconList();
  const [selectIcon, setSelectIcon] = useState(
    initIconInfo?.url ? initIconInfo : DefaultIconInfo,
  );
  const onSelectIcon = (item: FileInfo) => {
    const { url } = item;
    if (!url) {
      return;
    }
    setSelectIcon(item);
    setIconListVisible(false);
    onChange?.(item);
  };

  const onClearIcon = () => {
    setSelectIcon(DefaultIcon);
    setIconListVisible(false);
    onChange?.(undefined);
  };

  const IconListRender = () => {
    if (error) {
      return <IconListField />;
    }
    if (loading) {
      return <AnimateLoading />;
    }
    return (
      <IconList
        initValue={selectIcon}
        list={iconList}
        onSelect={onSelectIcon}
        onClear={onClearIcon}
      />
    );
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    onLoadList?.(iconList);
  }, [loading]);

  useEffect(() => {
    initIconInfo && onSelectIcon(initIconInfo);
  }, [initIconInfo]);

  return (
    <Popover
      trigger="custom"
      visible={iconListVisible}
      onClickOutSide={() => setIconListVisible(false)}
      position="bottomLeft"
      spacing={{
        x: 0,
        y: 10,
      }}
      content={IconListRender()}
    >
      <div
        className="flex items-center"
        onClick={() => setIconListVisible(true)}
      >
        <Icon
          icon={selectIcon}
          width={22}
          height={24}
          className={cls({
            'coz-mg-secondary-pressed': iconListVisible,
          })}
        />
      </div>
    </Popover>
  );
};

export const ShortcutIconField: FC<ShortcutIconProps & CommonFieldProps> =
  withField(ShortcutIcon);
