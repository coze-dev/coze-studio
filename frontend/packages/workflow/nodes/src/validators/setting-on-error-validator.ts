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

import { z } from 'zod';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';
import { I18n } from '@coze-arch/i18n';

import { SettingOnErrorProcessType } from '../setting-on-error/types';

const SettingOnErrorSchema = z.object({
  settingOnErrorIsOpen: z.boolean().optional(),
  settingOnErrorJSON: z.string().optional(),
  processType: z.number().optional(),
});

type SettingOnError = z.infer<typeof SettingOnErrorSchema>;

export const settingOnErrorValidator = ({
  value,
}: ValidatorProps<SettingOnError>) => {
  if (!value) {
    return true;
  }

  function isJSONVerified(settingOnError: SettingOnError) {
    if (settingOnError?.settingOnErrorIsOpen) {
      if (
        settingOnError?.processType &&
        settingOnError?.processType !== SettingOnErrorProcessType.RETURN
      ) {
        return true;
      }
      try {
        JSON.parse(settingOnError?.settingOnErrorJSON as string);
        // eslint-disable-next-line @coze-arch/use-error-in-catch
      } catch (e) {
        return false;
      }
    }
    return true;
  }
  // json legitimacy check
  const schemeParesd = SettingOnErrorSchema.refine(
    settingOnError => isJSONVerified(settingOnError),
    {
      message: I18n.t('workflow_exception_ignore_json_error'),
    },
  ).safeParse(value);

  if (!schemeParesd.success) {
    return JSON.stringify((schemeParesd as any).error);
  }

  return true;
};
