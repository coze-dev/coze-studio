import classNames from 'classnames';
import { UIButton } from '@coze-arch/bot-semi';

import style from './index.module.less';

interface Props {
  illustrationIcon: JSX.Element;
  description: string;
  btnText?: string;
  className?: string;
  onClick?: () => void;
  secondDesc?: string;
}
export const Empty = (props: Props) => {
  const {
    description,
    onClick,
    btnText,
    illustrationIcon,
    className,
    secondDesc,
  } = props;

  return (
    <div className={classNames(style['auth-empty-wrapper'], className)}>
      <div className={style['auth-empty']}>
        <div className={style['auth-empty-image']}>{illustrationIcon}</div>
        <div className={style['auth-empty-description']}>{description}</div>
        {secondDesc ? (
          <div className={style['auth-empty-second-desc']}>{secondDesc}</div>
        ) : null}
        {btnText ? (
          <UIButton
            type="tertiary"
            className={style['auth-empty-button']}
            onClick={onClick}
          >
            {btnText}
          </UIButton>
        ) : null}
      </div>
    </div>
  );
};
