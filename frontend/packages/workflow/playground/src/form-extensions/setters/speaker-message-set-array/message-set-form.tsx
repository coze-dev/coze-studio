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

import { type FC, useRef, useState } from 'react';

import classnames from 'classnames';
import { type SetterOrDecoratorContext } from '@flowgram-adapter/free-layout-editor';
import { concatTestId } from '@coze-workflow/base';
import { RoleType } from '@coze-arch/idl/social_api';
import { I18n } from '@coze-arch/i18n';
import { Button, Space, Form } from '@coze-arch/coze-design';

import {
  MessageGenerateMode,
  type SpeakerMessageSetValue,
  type SpeakerSelectValue,
  type OtherMessageSetValue,
} from './types';
import { SpeakerSelect } from './speaker-select';
import { MessageContentField } from './message-content';
import { useSpeakerMessageSetContext } from './context';

import styles from './message-set-form.module.less';

const { Radio, RadioGroup } = Form;

type MessageSetFormValue = Partial<
  {
    speaker: SpeakerSelectValue;
  } & OtherMessageSetValue
>;

interface MessageSetFormProps {
  setterContext: SetterOrDecoratorContext;
  initialValue: SpeakerMessageSetValue | undefined;
  onSubmit: (value: SpeakerMessageSetValue) => void;
  onCancel: () => void;
}

const formatInitialValue = (
  initValue: SpeakerMessageSetValue | undefined,
): MessageSetFormValue | undefined => {
  if (!initValue) {
    return initValue;
  }

  return {
    speaker: {
      biz_role_id: initValue.biz_role_id,
      nickname: initValue.nickname,
      role: initValue.role,
      role_type: initValue.role_type as RoleType,
    },
    generate_mode: initValue.generate_mode,
    content: initValue.content,
  };
};

export const MessageSetForm: FC<MessageSetFormProps> = props => {
  const { testId } = useSpeakerMessageSetContext();
  const { initialValue, onSubmit, onCancel, setterContext } = props;
  const formRef = useRef<Form<MessageSetFormValue>>(null);

  const [formValue, setFormValue] = useState<MessageSetFormValue | undefined>(
    formatInitialValue(initialValue),
  );

  const handleGenerateModeChange = e => {
    if (e.target.value === MessageGenerateMode.GenerateByAgent) {
      formRef.current?.formApi.setValue('content', '');
    }
  };

  const handleOnValueChange = (values: MessageSetFormValue) => {
    setFormValue({ ...values });
  };

  const handleSubmit = (values: MessageSetFormValue) => {
    const { speaker = {}, ...others } = values || {};
    onSubmit?.({
      ...speaker,
      ...others,
    } as unknown as SpeakerMessageSetValue);
  };

  const handleSpeakerChange = (speaker: SpeakerSelectValue | undefined) => {
    if (typeof speaker === 'undefined') {
      return;
    }
    if (!speaker.biz_role_id || (speaker.biz_role_id && !speaker.nickname)) {
      if (
        formRef.current?.formApi.getValue('generate_mode') ===
        MessageGenerateMode.FixedContent
      ) {
        formRef.current.formApi.setValue(
          'generate_mode',
          MessageGenerateMode.GenerateByAgent,
        );
        formRef.current.formApi.setValue('content', undefined);
      }
    }
  };

  return (
    <div className="w-[480px] p-6">
      <Form<MessageSetFormValue>
        initValues={formatInitialValue(initialValue)}
        onSubmit={handleSubmit}
        onValueChange={handleOnValueChange}
        ref={formRef}
        className={styles['speaker-message-set-form']}
      >
        <SpeakerSelect
          field="speaker"
          label={I18n.t(
            'scene_workflow_chat_node_conversation_content_speaker',
            {},
            'Speaker',
          )}
          rules={[
            {
              required: true,
              message: I18n.t(
                'scene_workflow_chat_node_conversation_batch_empty',
                {},
                '你必须添加一个发言人列表',
              ),
            },
          ]}
          onChange={handleSpeakerChange}
        />
        <RadioGroup
          field="generate_mode"
          label={I18n.t(
            'scene_workflow_chat_node_conversation_content_speaker_message_type',
            {},
            'Message type',
          )}
          rules={[{ required: true }]}
          onChange={handleGenerateModeChange}
        >
          <Radio
            value={MessageGenerateMode.FixedContent}
            disabled={
              formValue?.speaker
                ? !formValue?.speaker?.biz_role_id ||
                  (!!formValue.speaker.biz_role_id &&
                    !formValue.speaker.nickname)
                : false
            }
            data-testid={concatTestId(testId, 'messageSet', 'contentMode')}
          >
            {I18n.t(
              'scene_workflow_chat_node_conversation_content_speaker_fixed',
              {},
              'Fixed content',
            )}
          </Radio>
          <Radio
            value={MessageGenerateMode.GenerateByAgent}
            disabled={formValue?.speaker?.role_type === RoleType.Host}
          >
            {I18n.t(
              'scene_workflow_chat_node_conversation_content_speaker_generate',
              {},
              'Generate by Agent',
            )}
          </Radio>
        </RadioGroup>
        <MessageContentField
          field="content"
          fieldClassName={classnames({
            '!block':
              formValue?.generate_mode === MessageGenerateMode.FixedContent,
            hidden: true,
          })}
          label={I18n.t(
            'scene_workflow_chat_node_conversation_content_speaker_fixed_content',
            {},
            'Content',
          )}
          context={setterContext}
          placeholder={I18n.t(
            'scene_workflow_chat_node_conversation_content_speaker_fixed_placeholder',
            {},
            'You can use the {variable name}} method to introduce variables from the input parameters.',
          )}
          rules={[
            {
              required:
                formValue?.generate_mode === MessageGenerateMode.FixedContent
                  ? true
                  : false,
            },
          ]}
          fieldStyle={{
            overflow: 'visible',
          }}
        />
        <div className="flex justify-end mt-6">
          <Space>
            <Button
              color="primary"
              onClick={onCancel}
              data-testid={concatTestId(testId, 'messageSet', 'cancel')}
            >
              {I18n.t('cancel')}
            </Button>
            <Button
              color="hgltplus"
              htmlType="submit"
              className="btn-margin-right"
              onClick={() => formRef.current?.formApi.submitForm()}
              data-testid={concatTestId(testId, 'messageSet', 'submit')}
            >
              {I18n.t('confirm', {}, 'Confirm')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};
