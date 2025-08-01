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

import { IconCozCopy, IconCozCopyCheck } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import styles from './index.module.less';

const { Text } = Typography;

interface MessageTitleProps {
  text: string;
  copyContent?: string;
  description?: string;
  onCopyClick?: (text: string) => void;
}

export const MessageTitle = (props: MessageTitleProps) => {
  const { text, copyContent, description, onCopyClick } = props;

  return (
    <div className={styles['message-title']}>
      <Text
        className={styles['message-title-text']}
        copyable={
          copyContent
            ? {
                content: copyContent,
                icon: <IconCozCopy className={styles['copy-icon']} />,
                successTip: <IconCozCopyCheck />,
                onCopy: () => onCopyClick?.(copyContent),
              }
            : false
        }
      >
        {text}
      </Text>
      {description ? (
        <div className={styles['node-detail-title-description']}>
          {description}
        </div>
      ) : null}
    </div>
  );
};
