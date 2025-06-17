import { type FC, type MouseEvent } from 'react';

import { IconCozPluginFill } from '@coze-arch/coze-design/icons';
import { Typography, Highlight } from '@coze-arch/coze-design';

import styles from './styles.module.less';

interface NodesContainerProps {
  name: string;
  keyword?: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
}

export const PluginToolCard: FC<NodesContainerProps> = props => {
  const { name, onClick, keyword } = props;

  return (
    <div className={styles['plugin-tool-card']} key={name} onClick={onClick}>
      <IconCozPluginFill className="text-[16px] coz-fg-dim" />
      <Typography.Text
        size="normal"
        className="coz-fg-secondary leading-5"
        ellipsis={{
          showTooltip: {
            opts: {
              content: name,
              style: { wordBreak: 'break-word' },
            },
          },
        }}
      >
        <Highlight
          sourceString={name || ''}
          searchWords={keyword ? [keyword] : []}
          highlightStyle={{
            backgroundColor: 'transparent',
            color: 'var(--coz-fg-color-orange)',
            fontWeight: 400,
          }}
        />
      </Typography.Text>
    </div>
  );
};
