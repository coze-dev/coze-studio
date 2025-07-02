import {
  SettingOnErrorProcessType,
  useIsSettingOnErrorV2,
} from '@coze-workflow/nodes';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Field } from '../field';
import { ExceptionPort } from './exception-port';

export function ExceptionField() {
  const settingOnError = useWorkflowNode().data?.settingOnError;
  const hasException =
    settingOnError?.settingOnErrorIsOpen &&
    settingOnError?.processType === SettingOnErrorProcessType.EXCEPTION;
  const isSettingOnErrorV2 = useIsSettingOnErrorV2();

  if (!hasException || !isSettingOnErrorV2) {
    return null;
  }

  return (
    <Field label={I18n.t('workflow_250407_201', undefined, '异常处理')}>
      <div className="coz-fg-primary font-medium leading-4 text-md">
        {I18n.t('workflow_250407_202', undefined, '执行异常流程')}
      </div>
      <ExceptionPort />
    </Field>
  );
}
