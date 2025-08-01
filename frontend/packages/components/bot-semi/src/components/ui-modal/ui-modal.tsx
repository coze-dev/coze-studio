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
        // Align the UX specification, click on the translucent background and do not close by default
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
