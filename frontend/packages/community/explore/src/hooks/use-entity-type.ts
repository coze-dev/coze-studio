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

import { useState } from 'react';

import queryString from 'query-string';
import { useLoggedIn } from '@coze-arch/bot-hooks';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import { type ValidEntityType } from '../pages/search/type';
import { getAllowEntitySortList } from '../pages/search/config';
export const useEntityType = (): {
  entityType: ValidEntityType;
  setEntityType: (entityType: ValidEntityType) => void;
} => {
  const isLogin = useLoggedIn();

  const [entityTypeDefaylt] = useState(() => {
    const queryParam = queryString.parse(location.search);
    const entityTypeParam =
      Number(queryParam.entityType as unknown as string) ||
      ProductEntityType.SaasPlugin;

    const allowEntityType = getAllowEntitySortList({
      isLogin,
    });
    if (allowEntityType.includes(entityTypeParam)) {
      return entityTypeParam;
    }
    return ProductEntityType.SaasPlugin;
  });
  const [entityType, setEntityType] = useState(entityTypeDefaylt);
  return {
    entityType,
    setEntityType,
  };
};
