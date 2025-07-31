/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
