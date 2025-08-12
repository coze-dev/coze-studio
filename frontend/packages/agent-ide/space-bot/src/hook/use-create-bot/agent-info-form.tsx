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

import React, { type ComponentProps, Suspense, forwardRef, lazy } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  type BotSpace,
  SpaceType,
  type DraftBot,
} from '@coze-arch/bot-api/developer_api';
import { type UploadValue } from '@coze-common/biz-components/picture-upload';
import { IconTeamDefault } from '@coze-arch/bot-icons';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import {
  FormTextArea,
  FormInput,
  Tag,
  Form,
  FormSelect,
  Avatar,
  Typography,
} from '@coze-arch/coze-design';

import { FormSwitch } from './form-switch';

import s from './index.module.less';

const { Text } = Typography;

const LazyReactMarkdown = lazy(() => import('react-markdown'));

const ReactMarkdown = (props: ComponentProps<typeof LazyReactMarkdown>) => (
  <Suspense fallback={null}>
    <LazyReactMarkdown {...props} />
  </Suspense>
);

export type AgentInfoFormValue = Partial<{
  bot_uri: UploadValue;
  name: string;
  target: string;
  spaceId?: string;
  enableMonetize?: boolean;
}>;

export interface AgentInfoFormProps {
  className?: string;
  mode: 'add' | 'update';
  showSpace: boolean;
  initialValues: Partial<DraftBot>;
  spacesList: BotSpace[];
  currentSpaceId?: string; // Current space ID from store
  hideOperation?: boolean; // hide_operation from store
  checkErr: boolean;
  errMsg: string;
  onValuesChange: (values: AgentInfoFormValue) => void;
  slot?: React.ReactNode;
}

export const AgentInfoForm = forwardRef<
  Form<AgentInfoFormValue>,
  AgentInfoFormProps
>(
  // eslint-disable-next-line complexity
  (
    {
      className,
      mode,
      showSpace,
      initialValues,
      spacesList,
      currentSpaceId,
      hideOperation,
      checkErr,
      errMsg,
      onValuesChange,
      slot,
    },
    ref,
  ) => (
    <Form<AgentInfoFormValue>
      ref={ref}
      showValidateIcon={false}
      className={classNames(s['upload-form'], className)} // Ensure class name is correct
      onValueChange={values => {
        onValuesChange(values);
      }}
    >
      <FormInput
        initValue={botInputLengthService.sliceStringByMaxLength({
          value: initialValues?.name ?? '',
          field: 'botName',
        })}
        field="name"
        label={I18n.t('bot_create_name')}
        noErrorMessage
        maxLength={botInputLengthService.getInputLengthLimit('botName')}
        rules={[{ required: true }]}
        placeholder={I18n.t('bot_create_name_placeholder')}
        getValueLength={reactText =>
          botInputLengthService.getValueLength(reactText)
        }
      />
      {IS_OVERSEA && mode === 'add' ? (
        <FormSwitch
          field="enableMonetize"
          label={I18n.t('monetization')}
          desc={I18n.t('monetization_des')}
          initValue={true} // Consider if initial value should be prop
          rules={[{ required: true }]}
        />
      ) : null}
      <FormTextArea
        field="target"
        initValue={botInputLengthService.sliceStringByMaxLength({
          value: initialValues?.description ?? '',
          field: 'botDescription',
        })}
        label={I18n.t('bot_create_desciption')}
        placeholder={I18n.t('bot_create_description_placeholder')}
        maxCount={botInputLengthService.getInputLengthLimit('botDescription')}
        maxLength={botInputLengthService.getInputLengthLimit('botDescription')}
        getValueLength={botInputLengthService.getValueLength}
      />
      {showSpace && mode === 'add' ? (
        <FormSelect
          label={I18n.t('duplicate_select_workspace')}
          field="spaceId"
          initValue={
            hideOperation
              ? spacesList?.[0]?.id
              : currentSpaceId ?? spacesList?.[0]?.id
          }
          placeholder={I18n.t('select_team')}
          noErrorMessage
          className={classNames(s.select)}
          rules={[{ required: true }]}
          renderSelectedItem={(optionNode: BotSpace) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={optionNode.icon_url}
                size="extra-extra-small"
                style={{ flexShrink: 0 }}
              >
                {optionNode.name}
              </Avatar>
              <span className={classNames(s['select-name'])}>
                {optionNode.name}
              </span>
            </div>
          )}
        >
          {spacesList
            ?.filter(t => !t.hide_operation)
            ?.map(item => (
              <FormSelect.Option value={item.id} {...item} key={item.id}>
                <div className="ml-[8px]">
                  {item.icon_url ? (
                    <Avatar size="extra-small" src={item.icon_url} />
                  ) : (
                    <IconTeamDefault
                      className={classNames(s['select-item-icon'])}
                    />
                  )}
                </div>

                <div className={classNames(s['select-item-name'])}>
                  <Text
                    ellipsis={{
                      showTooltip: false,
                    }}
                    style={{
                      maxWidth: '280px',
                    }}
                  >
                    {item.name}
                  </Text>
                </div>
                {item.space_type === SpaceType.Team && (
                  <Tag color="brand">{I18n.t('develop_team_team')}</Tag>
                )}
              </FormSelect.Option>
            ))}
        </FormSelect>
      ) : null}
      {slot}
      {checkErr ? (
        <div className={s['content-check-error']}>
          <ReactMarkdown
            skipHtml={true}
            className={s.markdown}
            linkTarget="_blank"
          >
            {errMsg ?? I18n.t('publish_audit_pop7')}
          </ReactMarkdown>
        </div>
      ) : null}
    </Form>
  ),
);
