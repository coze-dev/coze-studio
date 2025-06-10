import ReactMarkdown from 'react-markdown';

import classNames from 'classnames';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import s from './index.module.less';

interface PublishPlatformDescriptionProps {
  desc: string;
}

export default function PublishPlatformDescription(
  props: PublishPlatformDescriptionProps,
) {
  const { desc = '' } = props;
  return (
    <Tooltip
      position="right"
      content={
        <div className={classNames(s['connector-tip'])}>
          <ReactMarkdown linkTarget="_blank">{desc}</ReactMarkdown>
        </div>
      }
    >
      <span style={{ lineHeight: 0 }}>
        <IconCozInfoCircle className="text-sm" />
      </span>
    </Tooltip>
  );
}
