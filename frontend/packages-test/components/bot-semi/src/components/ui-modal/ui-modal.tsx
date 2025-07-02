import { ComponentProps } from 'react';

import classNames from 'classnames';
import { Modal } from '@douyinfe/semi-ui';

import s from './index.module.less';

export type UIModalType =
  | 'info'
  | 'action-small'
  | 'action'
  | 'base-composition';

export type SemiModalProps = ComponentProps<typeof Modal>;

export interface UIModalProps extends SemiModalProps {
  type?: UIModalType;
  showScrollBar?: boolean;
}

export class UIModal extends Modal {
  props: UIModalProps;

  constructor(props: UIModalProps) {
    super(props);
    this.props = props;
  }

  render(): JSX.Element {
    const {
      centered = true,
      type = 'info',
      showScrollBar = false,
      className,
      okButtonProps,
      cancelButtonProps,
      ...props
    } = this.props;

    return (
      <Modal
        {...props}
        // 对齐 UX 规范，点击半透明背景默认不关闭
        maskClosable={false}
        centered={centered}
        cancelButtonProps={{
          style: {
            minWidth: '96px',
            ...cancelButtonProps?.style,
          },
          ...cancelButtonProps,
        }}
        okButtonProps={{
          style: {
            minWidth: '96px',
            ...okButtonProps?.style,
          },
          ...okButtonProps,
        }}
        className={classNames(
          s[`modal-${type}`],
          s['ui-modal'],
          showScrollBar && s['show-scroll-bar'],
          className,
        )}
      />
    );
  }
}

UIModal.defaultProps.centered = true;
