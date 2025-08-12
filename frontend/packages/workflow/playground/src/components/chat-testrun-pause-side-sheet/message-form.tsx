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

import { type FC, useRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
import { Form, ArrayField, UIButton, Typography } from '@coze-arch/bot-semi';
import { IconPlay } from '@douyinfe/semi-icons';

import { type MessageFormValue } from './types';

const { Input } = Form;

interface MessageFormProps {
  initValues: MessageFormValue;
  onSubmit: (values: MessageFormValue) => void;
}

export const MessageForm: FC<MessageFormProps> = props => {
  const { initValues, onSubmit } = props;
  const formRef = useRef<Form<MessageFormValue>>(null);

  const renderNickNameLabel = (nickName, roleName) => (
    <>
      {`${nickName}`} <Tag>{roleName ? roleName : nickName}</Tag>
    </>
  );

  return (
    <Form<MessageFormValue>
      ref={formRef}
      onSubmit={onSubmit}
      className="relative h-full flex flex-col"
    >
      <div className="p-6 rounded-lg coz-bg-max coz-stroke-primary flex-1 mb-6 border border-solid">
        <ArrayField field="Messages" initValue={initValues.Messages}>
          {({ arrayFields }) => (
            <>
              {arrayFields.map(({ field, key, remove }, index) => {
                if (initValues.Messages[index].content) {
                  return (
                    <div className="py-3">
                      <Form.Label>
                        {renderNickNameLabel(
                          initValues.Messages[index].nickname,
                          initValues.Messages[index].role,
                        )}
                      </Form.Label>

                      <div>
                        <Typography.Text>
                          {initValues.Messages[index].content}
                        </Typography.Text>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <Input
                      label={renderNickNameLabel(
                        initValues.Messages[index].nickname,
                        initValues.Messages[index].role,
                      )}
                      field={`${field}[content]`}
                      rules={[
                        {
                          required: true,
                          message: 'Required',
                        },
                      ]}
                    />
                  );
                }
              })}
            </>
          )}
        </ArrayField>
      </div>
      <div className="mb-6 text-right">
        <UIButton
          icon={<IconPlay />}
          type="primary"
          theme="solid"
          htmlType="submit"
          className="btn-margin-right "
        >
          {I18n.t(
            'scene_workflow_chat_node_test_run_button',
            {},
            'Continue running',
          )}
        </UIButton>
      </div>
    </Form>
  );
};
