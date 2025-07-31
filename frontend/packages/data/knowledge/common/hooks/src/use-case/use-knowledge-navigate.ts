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

import {
  useNavigate,
  type To,
  type Path,
  type NavigateOptions,
} from 'react-router-dom';

import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services/use-case';

/** useNavigate dedicated to the knowledge module for persisting common query parameters */
export const useKnowledgeNavigate: typeof useNavigate = () => {
  const navigate = useNavigate();
  const knowledgePageQuery = getKnowledgeIDEQuery();
  const overwriteNavigate = (to: To | number, opt?: NavigateOptions) => {
    if (typeof to === 'string') {
      const toPathname = to.startsWith('/') ? to : `${location.pathname}/${to}`;
      const urlObject = new URL(toPathname, window.location.origin);
      Object.entries(knowledgePageQuery).forEach(([queryKey, queryValue]) => {
        if (queryValue && !urlObject.searchParams.has(queryKey)) {
          urlObject.searchParams.set(queryKey, queryValue);
        }
      });
      const { pathname, search } = urlObject;
      return navigate(`${pathname}${search}`, opt);
    }
    if (isPathType(to)) {
      const { search } = to;
      const searchParams = new URLSearchParams(search);
      Object.entries(knowledgePageQuery).forEach(([queryKey, queryValue]) => {
        if (queryValue && !searchParams.has(queryKey)) {
          searchParams.set(queryKey, queryValue);
        }
      });
      return navigate({ ...to, search: searchParams.toString() }, opt);
    }
    if (isNumberType(to)) {
      return navigate(to);
    }
    return navigate(to, opt);
  };

  return overwriteNavigate;
};

const isPathType = (to: To | number): to is Partial<Path> =>
  typeof to === 'object';
const isNumberType = (to: To | number): to is number => typeof to === 'number';
