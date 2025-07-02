import { type FC } from 'react';

import classNames from 'classnames';

import {
  type ThinkingPlaceholderVariantProps,
  typeSafeThinkingPlaceholderVariants,
} from './variant';
import { type IThinkingPlaceholderProps } from './type';
import './animation.less';

const getVariantByProps = ({
  theme,
  showBackground,
}: {
  theme: IThinkingPlaceholderProps['theme'];
  showBackground: boolean;
}): ThinkingPlaceholderVariantProps => {
  if (showBackground) {
    return { backgroundColor: 'withBackground' };
  }
  if (!theme) {
    return { backgroundColor: null };
  }
  return { backgroundColor: theme };
};

export const ThinkingPlaceholder: FC<IThinkingPlaceholderProps> = props => {
  const { className, theme = 'none', showBackground } = props;

  return (
    <div
      className={classNames(
        typeSafeThinkingPlaceholderVariants(
          getVariantByProps({ showBackground: Boolean(showBackground), theme }),
        ),
        className,
      )}
    >
      <div className="chat-uikit-coz-thinking-placeholder"></div>
    </div>
  );
};
