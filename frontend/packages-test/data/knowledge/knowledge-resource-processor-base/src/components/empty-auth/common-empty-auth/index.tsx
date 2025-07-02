import classNames from 'classnames';
import { Button } from '@coze-arch/coze-design';

import style from './index.module.less';

export interface CommonEmptyAuthProps {
  illustrationIcon: JSX.Element;
  description: string;
  authUrl?: string;
  btnText?: string;
  className?: string;
  onClick?: () => void;
  secondDesc?: string;
}
export const AuthEmpty = (props: CommonEmptyAuthProps) => {
  const {
    description,
    authUrl,
    onClick,
    btnText,
    illustrationIcon,
    className,
    secondDesc,
  } = props;
  const handleClick = () => {
    if (authUrl) {
      window.open(authUrl, '_self');
    } else {
      onClick?.();
    }
  };

  return (
    <div className={classNames(style['auth-empty-wrapper'], className)}>
      <div className={style['auth-empty']}>
        <div className={style['auth-empty-image']}>{illustrationIcon}</div>
        <div className={style['auth-empty-description']}>{description}</div>
        {secondDesc ? (
          <div className={style['auth-empty-second-desc']}>{secondDesc}</div>
        ) : null}
        {btnText ? (
          <Button
            color="highlight"
            className={style['auth-empty-button']}
            onClick={handleClick}
          >
            {btnText}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
