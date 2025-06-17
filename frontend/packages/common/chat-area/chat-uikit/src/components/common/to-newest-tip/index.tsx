import classNames from 'classnames';
import { IconCozLongArrowUp } from '@coze-arch/coze-design/icons';

import { OutlinedIconButton } from '../button';
import { type ToNewestTipProps } from './type';
import './animation.less';

export const ToNewestTipUI = (props: ToNewestTipProps) => {
  const { onClick, style, className, show, showBackground } = props;
  return (
    <OutlinedIconButton
      className={classNames(
        [
          'shadow-normal',
          'coz-fg-hglt',
          'to-newest-tip-ui-animation',
          '!rounded-full',
        ],
        !show && ['pointer-events-none', 'opacity-0'],
        className,
      )}
      size="large"
      onClick={onClick}
      style={style}
      icon={<IconCozLongArrowUp className="rotate-180" />}
      showBackground={showBackground}
    />
  );
};

ToNewestTipUI.displayName = 'UIKitToNewestTip';
