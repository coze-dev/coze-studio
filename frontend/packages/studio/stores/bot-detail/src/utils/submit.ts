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
import { UIToast } from '@coze-arch/bot-semi';

export const hasBraces = (str: string) => {
  const pattern = /{{/g;
  return pattern.test(str);
};
// 判断是所有环境还是 只是release 环境限制{{}} 并弹出toast提示
export const verifyBracesAndToast = (str: string, isAll = false) => {
  if (isAll && hasBraces(str)) {
    UIToast.warning({
      showClose: false,
      content: I18n.t('bot_prompt_bracket_error'),
    });
    return false;
  }
  return true;
};
