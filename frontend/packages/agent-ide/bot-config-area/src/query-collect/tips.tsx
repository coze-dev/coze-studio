import classNames from 'classnames';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

export const Tips = ({
  content,
  size = 'medium',
}: {
  content: string;
  size: 'small' | 'medium';
}) => (
  <Tooltip content={content}>
    <div
      className={classNames(
        size === 'small'
          ? 'w-[16px] h-[16px] rounded-[4px]'
          : 'w-[24px] h-[24px] rounded-[8px]',
        'flex items-center justify-center hover:coz-mg-secondary-hovered cursor-pointer',
      )}
    >
      <IconCozInfoCircle className="coz-fg-secondary" />
    </div>
  </Tooltip>
);
