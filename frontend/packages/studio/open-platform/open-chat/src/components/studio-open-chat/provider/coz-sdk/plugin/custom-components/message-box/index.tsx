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

import cls from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { type CustomComponent } from '@coze-common/chat-area';

import styles from './index.module.less';
// coze-chat-message-wrapper coze-chat-hover-message-wrapper 用于element获取，不可删除
export const UIKitMessageBoxPlugin: CustomComponent['UIKitMessageBoxPlugin'] =
  ({ messageType, classname, ...props }) => (
    <UIKitMessageBox
      {...props}
      classname={cls(classname, 'w-full')}
      isHoverShowUserInfo={false}
      messageBoxWrapperClassname={cls(
        'coze-chat-message-wrapper',
        styles['message-box-wrapper'],
      )}
      messageHoverWrapperClassName={
        'w-full flex justify-end right-[0px] coze-chat-hover-message-wrapper'
      }
    />
  );
