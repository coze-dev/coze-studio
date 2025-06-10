import { type FC, useState } from 'react';

// import { useArraySetterItemContext } from '@coze-workflow/setters';
import classnames from 'classnames';
import { type SetterOrDecoratorContext } from '@flowgram-adapter/free-layout-editor';
import { concatTestId } from '@coze-workflow/base';
import { Popover } from '@coze/coze-design';
// import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ValidationErrorWrapper } from '@/form-extensions/components/validation';

import {
  RoleMessageSetValueDisplay,
  NicknameMessageSetValueDisplay,
  Placeholder,
} from './value-display';
import { isRoleMessageSetValue } from './utils';
import { type Feedback, type SpeakerMessageSetValue } from './types';
import { MessageSetForm } from './message-set-form';
import { useSpeakerMessageSetContext } from './context';

export const SpeakerMessageSet: FC<{
  value: SpeakerMessageSetValue | undefined;
  onChange: (value: SpeakerMessageSetValue) => void;
  onVisibleChange?: () => void;
  defaultFocused?: boolean;
  setterContext: SetterOrDecoratorContext;
  feedback?: Feedback;
  index: number;
}> = props => {
  const { readonly, testId } = useSpeakerMessageSetContext();
  const {
    value,
    onChange,
    defaultFocused,
    setterContext,
    onVisibleChange,
    index,
  } = props;

  const [popupVisible, setPopupVisible] = useState(defaultFocused);

  const handleSubmit = (data: SpeakerMessageSetValue) => {
    onChange?.(data);
    setPopupVisible(false);
  };

  const handleVisibleChange = (visible: boolean) => {
    setPopupVisible(visible);
    onVisibleChange?.();
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ValidationErrorWrapper
        path={`[${index}]`}
        errorCompClassName={'output-param-name-error-type'}
      >
        {options => (
          <Popover
            visible={popupVisible}
            onVisibleChange={handleVisibleChange}
            trigger="click"
            content={
              <MessageSetForm
                setterContext={setterContext}
                initialValue={value}
                onSubmit={values => {
                  options.onChange();
                  handleSubmit(values);
                }}
                onCancel={() => setPopupVisible(false)}
              />
            }
          >
            <div
              className={classnames(
                'rounded-lg coz-bg-max h-[32px] cursor-pointer px-3 py-[6px] flex  items-center gap-2 overflow-hidden border-solid border',
                {
                  'pointer-events-none': readonly,
                  'border-[var(--semi-color-danger)]': options.showError,
                  'border-white': !options.showError,
                },
              )}
              data-testid={concatTestId(testId, 'selectedSpeaker')}
              onBlur={options.onBlur}
            >
              <div className="flex-1 overflow-hidden">
                {value ? (
                  isRoleMessageSetValue(value) ? (
                    <RoleMessageSetValueDisplay value={value} />
                  ) : (
                    <NicknameMessageSetValueDisplay value={value} />
                  )
                ) : (
                  <Placeholder />
                )}
              </div>
            </div>
          </Popover>
        )}
      </ValidationErrorWrapper>
    </div>
  );
};
