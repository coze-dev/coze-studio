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
