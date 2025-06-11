import { forwardRef, useMemo, useState } from 'react';

import { type PopoverProps as SemiPopoverProps } from '@douyinfe/semi-ui/lib/es/popover';
import { Popover as SemiPopover } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { Button } from '@/components/button';
import './popconfirm.css';

import { Content, Description, SubTitle } from '../common';
import { popconfirmVariants } from './popconfirm-variant';
import { type PopconfirmProps } from './popconfirm-types';

const defaultProps: Partial<PopconfirmProps> = {
  okButtonColor: 'brand',
  okButtonProps: {},
  trigger: 'click',
  cancelButtonColor: 'primary',
  cancelButtonProps: {},
};

const PopconfirmComponent = forwardRef<SemiPopover, PopconfirmProps>(
  (
    {
      dataTheme,
      className,
      children,
      content,
      title,
      defaultVisible,
      visible,
      trigger = defaultProps.trigger,
      onVisibleChange,
      onConfirm,
      onCancel,
      okText = 'ok',
      okButtonProps = defaultProps.okButtonProps,
      okButtonColor = defaultProps.okButtonColor,
      cancelText,
      cancelButtonProps = defaultProps.cancelButtonProps,
      cancelButtonColor = defaultProps.cancelButtonColor,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const [_visible, _setVisible] = useState(defaultVisible);
    const classes = cn(popconfirmVariants({}), className);

    const elementProps = {
      className: `${classes}`,
      'data-theme': dataTheme,
      ref,
    };

    const [confirmLoading, setConfirmLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const _content = useMemo(
      () => (
        <div className="coz-popconfirm-content">
          <div className="coz-popconfirm-title">{title}</div>
          {typeof content === 'string' ? <Content>{content}</Content> : content}
          <div className="coz-popconfirm-foot">
            {okText ? (
              <Button
                loading={confirmLoading}
                size="small"
                color={okButtonColor}
                {...okButtonProps}
                onClick={async e => {
                  setConfirmLoading(true);
                  try {
                    await onConfirm?.(e);
                  } catch (error) {
                    setConfirmLoading(false);
                    console.error(error);
                    return;
                  }
                  setConfirmLoading(false);
                  _setVisible(false);
                }}
              >
                {okText}
              </Button>
            ) : undefined}

            {cancelText ? (
              <Button
                loading={cancelLoading}
                size="small"
                color={cancelButtonColor}
                {...cancelButtonProps}
                onClick={async e => {
                  setCancelLoading(true);
                  try {
                    await onCancel?.(e);
                  } catch (error) {
                    setCancelLoading(false);
                    console.error(error);
                    return;
                  }
                  setCancelLoading(false);
                  _setVisible(false);
                }}
              >
                {cancelText}
              </Button>
            ) : undefined}
          </div>
        </div>
      ),
      [
        content,
        title,
        okButtonColor,
        okButtonProps,
        okText,
        cancelButtonColor,
        cancelButtonProps,
        cancelText,
        onConfirm,
        onCancel,
        cancelLoading,
        confirmLoading,
      ],
    );

    return (
      <SemiPopover
        {...(elementProps as SemiPopoverProps)}
        {...(rest as SemiPopoverProps)}
        content={_content}
        trigger={trigger}
        visible={trigger === 'custom' ? visible : _visible}
        onVisibleChange={v => {
          _setVisible(v);
          onVisibleChange?.(v);
        }}
      >
        {children}
      </SemiPopover>
    );
  },
);

PopconfirmComponent.displayName = 'Popconfirm';

export const Popconfirm = Object.assign(PopconfirmComponent, {
  SubTitle,
  Description,
  Content,
});
