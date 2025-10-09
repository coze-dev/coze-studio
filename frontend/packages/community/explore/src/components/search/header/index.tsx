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

import { useNavigate, useNavigationType } from 'react-router-dom';
import React, { useRef, useEffect, useState } from 'react';

import cls from 'classnames';
import {
  SearchInput,
  type SearchInputRef,
} from '@coze-community/components/search-input/index.js';
import { getEntityUrl } from '@coze-community/components/search-input/config.js';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { UILayout, UIButton, Space } from '@coze-arch/bot-semi';
import {
  IconSvgCozeTxtCn,
  IconSvgCozeTxtEn,
  IconSvgCozeLogo,
} from '@coze-arch/bot-icons';
import { useInitialValue } from '@coze-arch/bot-hooks';

import { type ValidEntityType } from '../../../pages/search/type';

import styles from './index.module.less';

interface Props {
  isResponsive: boolean;
  isLogin: boolean;
  searchWord: string;
  entityType: ValidEntityType;
}

export const Header = (props: Props) => {
  const { isResponsive, isLogin, searchWord, entityType } = props;
  const searchInputRef = useRef<SearchInputRef>(null);
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  // 使用初次返回的值
  const canHistoryBack = useInitialValue(navigationType === 'PUSH');
  const backUrl = useInitialValue(getEntityUrl(entityType));
  const [isSearchInputActive, setIsSearchInpuytActive] = useState(false);
  const loginButton = (
    <UIButton
      className={styles['login-btn']}
      onClick={() => {
        sendTeaEvent(EVENT_NAMES.get_start, {
          URL: location.pathname,
          is_login: false,
          action: 'click_get_started',
          source: 'search',
        });
        navigate(`/sign?redirect=${encodeURIComponent(backUrl)}`);
      }}
    >
      {I18n.t('landing_title_get_started')}
    </UIButton>
  );

  useEffect(() => {
    searchInputRef.current?.setInputValue(searchWord);
  }, [entityType]);

  return (
    <UILayout.Header
      className={cls(styles.header, { [styles.isResponsive]: isResponsive })}
    >
      {isResponsive && !isLogin ? (
        <div className={styles.headerTop}>
          <Space spacing={8} className={styles.logoContainer}>
            <IconSvgCozeLogo className={styles['logo-coze']} />

            <div className={cls(styles['logo-text-container'])}>
              {IS_OVERSEA ? (
                <IconSvgCozeTxtEn className={styles['logo-txt']} />
              ) : (
                <IconSvgCozeTxtCn className={styles['logo-txt']} />
              )}
            </div>
          </Space>
          {loginButton}
        </div>
      ) : null}
      <div className={styles.headerBottom}>
        <div
          className={cls(styles.arrowContainer, {
            [styles.hidden]: isResponsive && isSearchInputActive,
          })}
          onClick={() => {
            if (!isLogin) {
              navigate('/');
            } else if (canHistoryBack) {
              window.history.back();
            } else {
              navigate(backUrl);
            }
          }}
        >
          <UIButton
            theme="borderless"
            icon={<IconCozCross width={'18'} height={'18'} />}
            className={cls({ [styles['back-btn']]: !isResponsive })}
          />
        </div>
        <SearchInput
          ref={searchInputRef}
          className={styles.input}
          defaultValue={searchWord}
          onSearch={(value: string) =>
            navigate(value, {
              replace: true,
            })
          }
          useResponsive={isResponsive}
          entityType={entityType}
          onActiveChange={(isActice: boolean) => {
            setIsSearchInpuytActive(isActice);
          }}
        />
        {!isLogin && !isResponsive && loginButton}
      </div>
    </UILayout.Header>
  );
};
