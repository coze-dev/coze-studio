import { type FC } from 'react';

import classNames from 'classnames';
import { IconCozStopCircle } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

interface IProps {
  className?: string;
  content: string;
  onClick?: () => void;
}

export const StopRespondButton: FC<IProps> = props => {
  const { content, onClick, className } = props;
  return (
    <Button
      color="secondary"
      onClick={onClick}
      className={classNames(
        'coz-stroke-primary',
        'coz-fg-primary',
        'border-[1px]',
        'border-solid',
        'coz-shadow-default',
        className,
      )}
      icon={<IconCozStopCircle />}
    >
      {content}
    </Button>
  );
};

StopRespondButton.displayName = 'StopRespondButton';
