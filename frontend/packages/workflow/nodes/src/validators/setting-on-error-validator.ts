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
  // json 合法性校验
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
