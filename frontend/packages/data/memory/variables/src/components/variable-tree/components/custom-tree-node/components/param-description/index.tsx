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

import { I18n } from '@coze-arch/i18n';
import { Input } from '@coze-arch/coze-design';

import { type Variable } from '@/store';

import { ReadonlyText } from '../readonly-text';

export const ParamDescription = (props: {
  data: Variable;
  onChange: (value: string) => void;
  readonly: boolean;
}) => {
  const { data, onChange, readonly } = props;
  return !readonly ? (
    <div className="flex flex-col w-full relative overflow-hidden">
      <Input
        value={data.description}
        placeholder={I18n.t('workflow_detail_llm_output_decription')}
        maxLength={200}
        onChange={value => {
          onChange(value);
        }}
        className="w-full"
      />
    </div>
  ) : (
    <ReadonlyText value={data.description ?? ''} />
  );
};
