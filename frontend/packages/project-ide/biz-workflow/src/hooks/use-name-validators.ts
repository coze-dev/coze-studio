import { type RefObject } from 'react';

import {
  useResourceList,
  type BizResourceType,
} from '@coze-project-ide/biz-components';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
export const useNameValidators = ({
  currentResourceRef,
}: {
  currentResourceRef?: RefObject<BizResourceType | undefined>;
} = {}): Array<{
  validator: (rules: unknown[], value: string) => boolean | Error;
}> => {
  const { workflowResource } = useResourceList();
  return [
    {
      validator(_, value) {
        // 过滤掉当前资源
        const otherResource = currentResourceRef?.current
          ? workflowResource.filter(
              r => r.res_id !== currentResourceRef?.current?.res_id,
            )
          : workflowResource;
        if (otherResource.map(item => item.name).includes(value)) {
          return new CustomError(
            REPORT_EVENTS.formValidation,
            I18n.t('project_resource_sidebar_warning_label_exists', {
              label: value,
            }),
          );
        }
        return true;
      },
    },
  ];
};
