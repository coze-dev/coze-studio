import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';

import { feedbackStatus2ValidateStatus } from '../components/utils';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function toStandardSetter(Setter) {
  // 修复传给setter的表达式不响应的问题
  const ObserverSetter = Setter;
  return function StandardSetter(props: SetterComponentProps) {
    const {
      value,
      onChange,
      readonly = false,
      options,
      feedbackStatus,
    } = props;

    const { getNodeSetterId } = useNodeTestId();
    const setterTestId = getNodeSetterId('');
    const validateStatus = feedbackStatus2ValidateStatus(feedbackStatus);

    return (
      <ObserverSetter
        value={value}
        onChange={onChange}
        {...options}
        readonly={readonly || options.readonly}
        testId={setterTestId}
        validateStatus={validateStatus}
      />
    );
  };
}
