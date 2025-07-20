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
  /** 原始值 */
  originVal?: string;
  /** 是否为海外（海外不允许输入中文 ，与PluginName校验规则对齐） */
  isOversea?: boolean;
}

/**
 * 校验名称格式（参考插件名称）
 * - 海外：仅支持输入字母、数字、下划线或空格
 * - 国内：仅支持输入中文、字母、数字、下划线或空格
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
 * Testset名称表单校验规则
 *
 * @param param.bizCtx - bizCtx
 * @param param.bizComponentSubject - bizComponentSubject
 * @param param.originVal - 原始值
 * @param param.isOversea - 是否为海外（海外不允许输入中文 ，与PluginName校验规则对齐）
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

        // 编辑模式下，名称与原名相同时跳过
        if (originVal && value === originVal) {
          return;
        }

        // 中文、字母等等等等
        const formatMsg = validateNamePattern(value, isOversea);

        if (formatMsg) {
          cb(formatMsg);
          return;
        }

        // 检查重复
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
