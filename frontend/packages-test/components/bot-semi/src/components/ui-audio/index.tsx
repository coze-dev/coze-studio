import React, { FC, useMemo } from 'react';

import classNames from 'classnames';
import {
  IconMobileSound,
  IconMobileSoundClosed,
  IconMobileSoundDisable,
  IconMobileSoundNormal,
} from '@coze-arch/bot-icons';

import { UIIconButton, UIIconButtonProps } from '../ui-icon-button';

import s from './index.module.less';

export enum UIAudioIconColor {
  Black = 'black',
  Blue = 'blue',
  Grey = 'grey',
}

export enum AudioStatus {
  Default = 'default',
  Playing = 'playing',
  Closed = 'closed',
}

const disableOpacity = 0.3;
const enableOpacity = 1;

export const IconCycle = React.memo(
  (props: {
    type: AudioStatus;
    color?: UIAudioIconColor;
    disabled?: boolean;
    iconCycleClassName?: string;
  }) => {
    const {
      type = AudioStatus.Default,
      color = UIAudioIconColor.Black,
      disabled = false,
      iconCycleClassName,
    } = props;

    return (
      <span
        style={{ opacity: disabled ? disableOpacity : enableOpacity }}
        className={classNames(
          s['icon-default'],
          s[`icon-${color}-${type}`],
          iconCycleClassName,
        )}
      ></span>
    );
  },
);

export interface UIAudioProps extends UIIconButtonProps {
  isPlaying?: boolean;
  disabled?: boolean;
  color?: UIAudioIconColor;
  onClick?: () => void;
  iconCycleClassName?: string;
  isClosed?: boolean;
  isMobile?: boolean;
}
export const UIAudio: FC<UIAudioProps> = props => {
  const {
    disabled = false,
    color = UIAudioIconColor.Black,
    isPlaying,
    isClosed,
    onClick,
    iconCycleClassName,
    isMobile = false,
    className,
    ...otherProps
  } = props;

  const type = useMemo(() => {
    if (isPlaying) {
      return AudioStatus.Playing;
    }
    if (isClosed) {
      return AudioStatus.Closed;
    }
    return AudioStatus.Default;
  }, [isPlaying, isClosed]);

  const mobileButton = () =>
    isPlaying ? (
      <IconMobileSound onClick={onClick} className={className} />
    ) : disabled ? (
      <IconMobileSoundDisable onClick={onClick} className={className} />
    ) : isClosed ? (
      <IconMobileSoundClosed onClick={onClick} className={className} />
    ) : (
      <IconMobileSoundNormal onClick={onClick} className={className} />
    );

  return isMobile ? (
    mobileButton()
  ) : (
    <UIIconButton
      iconSize="small"
      {...otherProps}
      disabled={disabled}
      icon={
        <IconCycle
          type={type}
          disabled={disabled}
          color={color}
          iconCycleClassName={`${iconCycleClassName} ${className}`}
        />
      }
      onClick={onClick}
    />
  );
};
