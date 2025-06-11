import { type PropsWithChildren, useRef, useCallback } from 'react';

// import { I18n } from '@coze-arch/i18n';
import { get } from 'lodash-es';
import cls from 'classnames';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { type ImageProps } from '@coze-arch/bot-semi/Image';
import { Popover, Image } from '@coze-arch/bot-semi';
import { IconGroupCardOutlined } from '@coze-arch/bot-icons';

import s from './index.module.less';

interface CardThumbnailPopoverProps extends PopoverProps {
  title?: string;
  url?: string;
  className?: string;
  imgProps?: ImageProps;
}

export const CardThumbnailPopover: React.FC<
  PropsWithChildren<CardThumbnailPopoverProps>
> = ({ children, url, title = '卡片预览', className, imgProps, ...props }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popoverRef = useRef<any>();

  const onImageLoad = useCallback(() => {
    const calcPosition = get(
      popoverRef.current,
      'tooltipRef.current.foundation.calcPosition',
    );
    if (typeof calcPosition === 'function') {
      calcPosition?.();
    }
  }, []);

  return (
    <Popover
      position="top"
      showArrow
      ref={popoverRef}
      content={
        <div className={s['popover-content']}>
          <div className={s['popover-card-title']}>{title}</div>
          {url && (
            <div className={s['popover-card-img']}>
              <Image src={url} {...imgProps} onLoad={onImageLoad} />
            </div>
          )}
        </div>
      }
      {...props}
    >
      {children || (
        <IconGroupCardOutlined
          className={cls(className, s['popover-card-icon'])}
        />
      )}
    </Popover>
  );
};
