import ReactMarkdown from 'react-markdown';
import { type FC, type ReactNode } from 'react';

import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import {
  MARKDOWN_TOOLTIP_CONTENT_MAX_WIDTH,
  MARKDOWN_TOOLTIP_WIDTH,
} from '../constants';

import styles from './index.module.less';

export const MdTooltip: FC<{
  content?: string;
  children?: ReactNode;
  tooltipPosition?: Parameters<typeof Tooltip>[0]['position'];
}> = ({ content, children, tooltipPosition }) => {
  if (!content) {
    return null;
  }

  return (
    <Tooltip
      content={
        <ReactMarkdown className={styles.md_wrap}>{content}</ReactMarkdown>
      }
      position={tooltipPosition}
      style={{
        maxWidth: MARKDOWN_TOOLTIP_WIDTH,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- css var
        // @ts-expect-error
        '--tooltip-content-max-width': `${MARKDOWN_TOOLTIP_CONTENT_MAX_WIDTH}px`,
      }}
    >
      {children || (
        <span className="cursor-pointer ml-[2px] h-[16px] w-[16px] inline-flex items-center">
          <IconCozInfoCircle className="text-[12px] coz-fg-secondary" />
        </span>
      )}
    </Tooltip>
  );
};
