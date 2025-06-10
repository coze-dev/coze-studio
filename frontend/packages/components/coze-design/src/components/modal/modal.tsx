/* eslint-disable @typescript-eslint/no-magic-numbers -- ignore */
/* eslint @coze-arch/max-line-per-function: ["error", {"max": 300}] */

import { forwardRef, useEffect, useMemo, useState, useCallback } from 'react';

import { type ModalReactProps as SemiModalReactProps } from '@douyinfe/semi-ui/lib/es/modal';
import { Modal as SemiModal } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { Button } from '@/components/button';

import { Content, Description, Scroll, SubTitle } from '../common';
import { useHandlePromise } from './use-handle-promise';
import { modalVariants } from './modal-variant';
import { type ModalProps, type ModalSize } from './modal-types';

import './modal.css';

const defaultProps: Partial<ModalProps> = {
  size: 'default',
  linearGradientMask: false,
  autoLoading: false,
  hasScroll: true,
};

const sizeMap: Record<ModalSize, string> = {
  default: '480px',
  small: '448px',
  medium: '684px',
  large: '640px',
  xl: '800px',
  xxl: '1120px',
  fill: '100%',
  'full-width': '100vw - 64px',
};

const defaultDialogWidth = '320px';

const CustomFooter = ({
  onCancel,
  onOk,
  cancelText,
  okText,
  okButtonColor,
  confirmLoading,
  cancelLoading,
  footerFill,
  okButtonProps,
  cancelButtonProps,
  autoLoading,
  destroy,
}) => {
  const { handleCancel, handleOk, autoCancelLoading, autoOkLoading } =
    useHandlePromise(onOk, onCancel, destroy);

  return (
    <div className={`coz-modal-footer ${footerFill ? 'footer-fill' : ''}`}>
      {cancelText ? (
        <Button
          color="primary"
          onClick={handleCancel}
          loading={autoLoading ? autoCancelLoading : cancelLoading}
          {...cancelButtonProps}
        >
          {cancelText}
        </Button>
      ) : null}
      {okText ? (
        <Button
          color={okButtonColor}
          onClick={handleOk}
          loading={autoLoading ? autoOkLoading : confirmLoading}
          {...okButtonProps}
        >
          {okText}
        </Button>
      ) : null}
    </div>
  );
};

const ModalComponent = forwardRef<SemiModal, ModalProps>(
  (
    {
      dataTheme,
      className,
      style,
      children,
      footer,
      okButtonColor,
      cancelText,
      okText,
      visible,
      onCancel,
      onOk,
      closable,
      confirmLoading,
      cancelLoading,
      footerFill,
      type = 'modal',
      okButtonProps = {},
      cancelButtonProps = {},
      size = defaultProps.size,
      autoLoading = defaultProps.autoLoading,
      hasScroll = defaultProps.hasScroll,
      linearGradientMask = defaultProps.linearGradientMask,
      width,
      height: _height = 'fit-content',
      bodyStyle,
      title,
      scrollerYRef,
      ...rest
    },
    ref,
  ): JSX.Element => {
    const classes = cn(
      modalVariants({}),
      className,
      `as-${type}`,
      `mode-size-${size}`,
    );

    const elementProps = {
      className: classes,
      'data-theme': dataTheme,
      ref,
    };

    const [clientHeight, setClientHeight] = useState(
      document.documentElement.clientHeight,
    );

    useEffect(() => {
      const handleResize = () => {
        setClientHeight(document.documentElement.clientHeight);
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    const { height, maxHeight } = useMemo(() => {
      const space = 80;
      const max = 960;
      const min = 480;

      let _fullHeight = clientHeight - space * 2;
      if (_fullHeight > max) {
        _fullHeight = max;
      } else if (_fullHeight < min) {
        _fullHeight = min;
      }

      let h = _height;
      if (_height === 'fit-content') {
        h = 'fit-content';
      } else if (_height === 'fill') {
        h = _fullHeight;
      } else if (typeof _height === 'number') {
        if (_height > _fullHeight) {
          h = _fullHeight;
        } else if (_height < min) {
          h = min;
        }
      }
      return { maxHeight: _fullHeight, height: h };
    }, [_height, clientHeight]);

    const _footer = useMemo(() => {
      if (footer) {
        return footer;
      }
      return (
        <CustomFooter
          autoLoading={autoLoading}
          onOk={onOk}
          onCancel={onCancel}
          cancelText={cancelText}
          okText={okText}
          okButtonColor={okButtonColor}
          confirmLoading={confirmLoading}
          cancelLoading={cancelLoading}
          footerFill={footerFill}
          okButtonProps={okButtonProps}
          cancelButtonProps={cancelButtonProps}
          destroy={null}
        />
      );
    }, [
      footer,
      cancelText,
      okText,
      okButtonColor,
      onCancel,
      onOk,
      footerFill,
      confirmLoading,
      autoLoading,
      cancelLoading,
      okButtonProps,
      cancelButtonProps,
    ]);

    const [modalId] = useState(`cdz-modal-${Math.random()}`.replace('.', ''));

    const [titleHeight, setTitleHeight] = useState(0);
    useEffect(() => {
      const _titleHeight =
        document
          ?.querySelector(`.${modalId}`)
          ?.querySelector('.semi-modal-header')
          ?.getBoundingClientRect()?.height ?? 0;

      setTitleHeight(_titleHeight);
    }, [title, modalId]);

    const [footerHeight, setFooterHeight] = useState(0);
    useEffect(() => {
      const _footerHeight =
        document
          ?.querySelector(`.${modalId}`)
          ?.querySelector('.semi-modal-footer')
          ?.getBoundingClientRect()?.height ?? 0;

      setFooterHeight(_footerHeight);
    }, [_footer, modalId]);

    const scrollMaxHeight = useMemo(
      () =>
        // 8 * 4 = modal.pt + modal.pb + gap * 2
        maxHeight - titleHeight - footerHeight - 8 * 4,
      [maxHeight, titleHeight, footerHeight],
    );

    const renderModalBody = useCallback(
      () =>
        typeof children === 'string' ? <Content>{children}</Content> : children,
      [children],
    );

    return (
      <SemiModal
        {...(elementProps as SemiModalReactProps)}
        {...(rest as SemiModalReactProps)}
        footer={_footer}
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        width={
          width ??
          (type === 'dialog' ? defaultDialogWidth : sizeMap[size as ModalSize])
        }
        height={height}
        style={{
          ...style,
        }}
        title={title}
        modalContentClass={modalId}
        closable={closable ?? type !== 'dialog'}
      >
        {hasScroll ? (
          <Scroll
            scrollerYRef={scrollerYRef}
            maxHeight={scrollMaxHeight}
            linearGradient={linearGradientMask}
          >
            {renderModalBody()}
          </Scroll>
        ) : (
          renderModalBody()
        )}
      </SemiModal>
    );
  },
);

ModalComponent.displayName = 'Modal';

const { info, success, error, warning, confirm, destroyAll } = SemiModal;

const getOrderModal =
  (fn, defaultOkButtonColor) =>
  ({
    className = '',
    footer,
    cancelText,
    okText,
    okButtonColor,
    onCancel,
    onOk,
    footerFill,
    confirmLoading,
    cancelLoading,
    icon = undefined,
    type = 'dialog',
    okButtonProps,
    cancelButtonProps = {},
    size = defaultProps.size,
    width,
    closable,
    autoLoading = false,
    ...rest
  }: ModalProps) => {
    const _okButtonColor = okButtonColor ?? defaultOkButtonColor;
    const config: SemiModalReactProps = {
      className: cn(
        'coz-modal',
        modalVariants({}),
        className,
        `as-${type}`,
        `mode-size-${size}`,
      ),
      cancelText,
      okText,
      okButtonColor: _okButtonColor,
      onCancel,
      onOk,
      footerFill,
      confirmLoading,
      cancelLoading,
      icon,
      okButtonProps,
      cancelButtonProps,
      width:
        width ??
        (type === 'dialog' ? defaultDialogWidth : sizeMap[size as ModalSize]),
      closable: closable ?? type !== 'dialog',
      autoLoading,
      ...rest,
    } as unknown as SemiModalReactProps;

    // 先渲染，拿到 destroy
    const { destroy, update } = fn(config);

    // 再渲染自定义 footer ，把 destroy 逻辑加进去
    update({
      footer: footer ?? (
        <CustomFooter
          onCancel={onCancel}
          onOk={onOk}
          autoLoading={autoLoading}
          cancelText={cancelText}
          okText={okText}
          okButtonColor={_okButtonColor}
          confirmLoading={confirmLoading}
          cancelLoading={cancelLoading}
          footerFill={footerFill}
          okButtonProps={okButtonProps}
          cancelButtonProps={cancelButtonProps}
          destroy={destroy}
        />
      ),
    });
    return { destroy, update };
  };

export const Modal = Object.assign(ModalComponent, {
  SubTitle,
  Description,
  Content,
  info: getOrderModal(info, 'brand'),
  success: getOrderModal(success, 'brand'),
  error: getOrderModal(error, 'red'),
  warning: getOrderModal(warning, 'yellow'),
  confirm: getOrderModal(confirm, 'brand'),
  destroyAll,
});
