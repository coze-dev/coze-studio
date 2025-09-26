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

import { get } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Field } from '@/components/node-render/node-render-new/fields';

import { InputParameters } from '../common/components';
import {
  PlatformStatusDisplay,
} from './components';

const MAX_QUERY_PREVIEW_LENGTH = 40;
const QUERY_PREVIEW_SLICE_LENGTH = 36;

const extractQuery = (query: unknown) => {
  if (typeof query === 'string') {
    return query;
  }
  if (query && typeof query === 'object') {
    const directContent = get(query, 'content');
    if (typeof directContent === 'string') {
      return directContent;
    }
    const nestedValue = get(query, 'value');
    if (nestedValue) {
      return extractQuery(nestedValue);
    }
    const literalContent = get(query, 'value.content');
    if (typeof literalContent === 'string') {
      return literalContent;
    }
  }
  return '';
};

function QueryPreview() {
  const node = useWorkflowNode();
  const rawQuery = extractQuery(node?.inputs?.query);
  if (!rawQuery) {
    return <span className="text-xs text-[#9CA3AF]">{I18n.t('未配置')}</span>;
  }
  const clipped =
    rawQuery.length > MAX_QUERY_PREVIEW_LENGTH
      ? `${rawQuery.slice(0, QUERY_PREVIEW_SLICE_LENGTH)}...`
      : rawQuery;
  return <span className="text-xs text-[#374151]">{clipped}</span>;
}

export function AgentContent() {
  return (
    <>
      <Field label={I18n.t('平台')}>
        <PlatformStatusDisplay />
      </Field>
      <Field label={I18n.t('查询内容')}>
        <QueryPreview />
      </Field>
      <InputParameters label={I18n.t('动态参数')} />
    </>
  );
}
