import classNames from 'classnames';
import { Space, Typography, Tooltip } from '@coze-arch/coze-design';
import { Image } from '@coze-arch/bot-semi';

import AvatarDefault from '../../assets/avatar_default.png';

import s from './index.module.less';
const { Text } = Typography;
interface AvatarNameProps {
  avatar?: string;
  username?: string;
  name?: string;
  label?: {
    name?: string;
    icon?: string;
    href?: string;
  };
  theme?: 'default' | 'light' | 'white';
  className?: string;
  nameMaxWidth?: number;
  size?: 'default' | 'large' | 'small';
  renderCenterSlot?: React.ReactNode;
}

export const AvatarSizeMap = {
  small: 12,
  default: 14,
  large: 16,
};

export const AvatarName = ({
  avatar,
  username,
  name,
  label,
  theme,
  className,
  nameMaxWidth,
  size = 'default',
  renderCenterSlot = null,
}: AvatarNameProps) => (
  <Space
    spacing={4}
    className={classNames(
      s.container,
      theme && s[theme],
      { [s.large]: size === 'large' },
      className,
    )}
  >
    <Image
      width={AvatarSizeMap[size]}
      height={AvatarSizeMap[size]}
      src={avatar || AvatarDefault}
      fallback={<img src={AvatarDefault} width={'100%'} height={'100%'} />}
      preview={false}
      className={s.avatar}
    />
    <Space spacing={2}>
      <Text
        className={classNames(s.txt, s.name)}
        ellipsis={{ showTooltip: false, rows: 1 }}
        style={
          typeof nameMaxWidth === 'number' ? { maxWidth: nameMaxWidth } : {}
        }
      >
        {name}
      </Text>
      {label?.icon ? (
        <Tooltip
          showArrow
          content={label?.name}
          position={'top'}
          trigger={label?.name ? 'hover' : 'custom'}
        >
          <img
            src={label?.icon}
            className={s['label-icon']}
            tabIndex={-1}
            onMouseDown={event => {
              if (label?.href) {
                event?.preventDefault();
                event?.stopPropagation();
                window.open(label.href, '_blank');
              }
            }}
          />
        </Tooltip>
      ) : null}
    </Space>
    {renderCenterSlot}
    {username ? (
      <Text
        className={classNames(s.txt, s.username)}
        ellipsis={{ showTooltip: false, rows: 1 }}
      >
        @{username}
      </Text>
    ) : null}
  </Space>
);
