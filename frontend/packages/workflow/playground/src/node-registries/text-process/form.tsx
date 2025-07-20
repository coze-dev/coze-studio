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
 
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { useWatch } from '@/form';

import { OutputsField } from '../common/fields';
import { isSplitMethod } from './utils';
import { CONCAT_DEFAULT_INPUTS, type StringMethod } from './constants';
import {
  MethodSelectorSetter,
  Inputs,
  ConcatSetting,
  DelimiterSelectorField,
} from './components';

const Render = () => {
  // 监听字符处理方法变更
  const method = useWatch<StringMethod>({ name: 'method' });

  // 是否为字符串分割
  const isSplit = isSplitMethod(method);

  return (
    <NodeConfigForm>
      {/* 选择字符串应用 */}
      <MethodSelectorSetter name="method" />

      {/* 输入 */}
      <Inputs
        name="inputParameters"
        defaultValue={CONCAT_DEFAULT_INPUTS}
        // 字符串分隔只能有一个输入
        minItems={isSplit ? 1 : 0}
        maxItems={isSplit ? 1 : Number.MAX_SAFE_INTEGER}
        // 字符串分割只能输入字符串
        inputType={isSplit ? ViewVariableType.String : undefined}
        disabledTypes={
          isSplit
            ? ViewVariableType.getComplement([ViewVariableType.String])
            : []
        }
      />

      {/* 字符串分割/拼接设置 */}
      {isSplit ? (
        <DelimiterSelectorField name="delimiter" hasFeedback={false} />
      ) : (
        <ConcatSetting
          concatCharFieldName="concatChar"
          concatResultFieldName="concatResult"
        />
      )}

      {/* 输出 */}
      <OutputsField
        name="outputs"
        title={I18n.t('workflow_detail_node_output')}
        tooltip={I18n.t('workflow_stringprocess_output_tooltips')}
        id="text-process-node-output"
        topLevelReadonly={true}
        customReadonly
      />
    </NodeConfigForm>
  );
};

export default Render;
