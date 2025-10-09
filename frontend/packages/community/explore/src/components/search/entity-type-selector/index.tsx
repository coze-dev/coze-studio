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

import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { formatNumber } from '@coze-arch/bot-utils';
import { Space, Typography } from '@coze-arch/bot-semi';
import { useLoggedIn } from '@coze-arch/bot-hooks';

import { type ValidEntityType } from '../../../pages/search/type';
import { useSearchStore } from '../../../pages/search/search-store';
import {
  entitySelectorI18nKeyMap,
  getAllowEntitySortList,
} from '../../../pages/search/config';

import styles from './index.module.less';

interface SelectorProps {
  isSelected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}
const { Text } = Typography;
const EntitySelector = (props: SelectorProps) => {
  const { isSelected, children, onClick } = props;

  return (
    <Text
      onClick={onClick}
      className={cls(styles.item, { [styles.isSelected]: isSelected })}
    >
      {children}
    </Text>
  );
};

export const EntityTypeSelector = (props: {
  isResponsive?: boolean;
  entityType: ValidEntityType;
  setEntityType: (val: ValidEntityType) => void;
}) => {
  const { isResponsive, setEntityType, entityType } = props;
  const { totalCount, resetSearchFilter } = useSearchStore();
  const navigate = useNavigate();
  const isLogin = useLoggedIn();

  const onUpdateEntityType = (type: ValidEntityType) => {
    setEntityType(type);
    resetSearchFilter();
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('entityType', String(type));
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const entitySeloctorList = getAllowEntitySortList({
    isLogin,
  });
  useEffect(
    () => () => {
      resetSearchFilter();
    },
    [],
  );
  return (
    <Space
      spacing={4}
      className={styles['selector-container']}
      style={{
        marginTop: isResponsive ? '24px' : undefined,
      }}
    >
      {entitySeloctorList.map(entityTypeTemp => (
        <EntitySelector
          key={entityTypeTemp}
          isSelected={entityType === entityTypeTemp}
          onClick={() => onUpdateEntityType(entityTypeTemp as ValidEntityType)}
        >
          {I18n.t(entitySelectorI18nKeyMap[entityTypeTemp], {
            amount: formatNumber(totalCount[entityTypeTemp] || 0),
            num: totalCount[entityTypeTemp] || 0,
          })}
        </EntitySelector>
      ))}
    </Space>
  );
};
