import { type CSSProperties, type FC } from 'react';

import { merge } from 'lodash-es';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';

import { ERROR_LINE_HEIGHT } from '../../constants';

export const RequiredWarn: FC<{
  text?: string;
  className?: string;
  style?: CSSProperties;
  absolute?: boolean;
}> = props => {
  const { text, style, className, absolute = true } = props;
  return (
    <div
      className={classNames(
        className,
        'coz-fg-hglt-red text-[10px]',
        'ml-[8px]',
        'whitespace-nowrap',
        absolute ? 'absolute' : '',
      )}
      style={merge(
        {
          lineHeight: `${ERROR_LINE_HEIGHT}px`,
        },
        style,
      )}
    >
      {text || I18n.t('publish_base_configFields_requiredWarn')}
    </div>
  );
};
