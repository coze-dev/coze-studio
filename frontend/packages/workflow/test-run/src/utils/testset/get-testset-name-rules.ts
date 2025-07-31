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

import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  type ComponentSubject,
  type BizCtx,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

interface GetTestsetNameRulesProps {
  /** bizCtx */
  bizCtx?: BizCtx;
  /** bizComponentSubject */
  bizComponentSubject?: ComponentSubject;
  /** raw value */
  originVal?: string;
  /** Whether it is overseas (overseas is not allowed to enter Chinese, it is aligned with the PluginName verification rule) */
  isOversea?: boolean;
}

/**
 * Verification name format (refer to plug-in name)
 * - Overseas: Only support entering letters, numbers, underscores or spaces
 * - Domestic: Only supports entering Chinese, letters, numbers, underscores or spaces
 */
function validateNamePattern(
  name: string,
  isOversea?: boolean,
): string | undefined {
  try {
    const pattern = isOversea ? /^[\w\s]+$/ : /^[\w\s\u4e00-\u9fa5]+$/u;
    const msg = isOversea
      ? I18n.t('create_plugin_modal_nameerror')
      : I18n.t('create_plugin_modal_nameerror_cn');

    return pattern.test(name) ? undefined : msg;
  } catch (e: any) {
    logger.error(e);
    return undefined;
  }
}

/**
 * TestSet Name Form Validation Rules
 *
 * @param param.bizCtx - bizCtx
 * @param param.bizComponentSubject - bizComponentSubject
 * @Param param.originVal - original value
 * @Param param.isOverseas - whether it is overseas (overseas is not allowed to enter Chinese, it is aligned with the PluginName verification rule)
 */
export function getTestsetNameRules({
  bizCtx,
  bizComponentSubject,
  originVal,
  isOversea,
}: GetTestsetNameRulesProps): any[] {
  const requiredMsg = I18n.t('workflow_testset_required_tip', {
    param_name: I18n.t('workflow_testset_name'),
  });

  return [
    { required: true, message: requiredMsg },
    {
      asyncValidator: async (_rules, value: string, cb) => {
        // required
        if (!value) {
          cb(requiredMsg);
          return;
        }

        // In edit mode, skip when the name is the same as the original name
        if (originVal && value === originVal) {
          return;
        }

        // Chinese, letters, etc., etc
        const formatMsg = validateNamePattern(value, isOversea);

        if (formatMsg) {
          cb(formatMsg);
          return;
        }

        // Check for duplicates
        try {
          const { isPass } = await debuggerApi.CheckCaseDuplicate({
            bizCtx,
            bizComponentSubject,
            caseName: value,
          });

          if (isPass) {
            cb();
            return;
          }
          cb(I18n.t('workflow_testset_name_duplicated'));
          // eslint-disable-next-line @coze-arch/use-error-in-catch -- no catch
        } catch {
          cb();
        }
      },
    },
  ];
}
