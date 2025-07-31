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

import { useState, type PropsWithChildren, useEffect, useRef } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { useSpaceList, useSpaceStore } from '@coze-arch/bot-studio-store';
import {
  UIModal,
  UITag,
  Form,
  Avatar,
  UIFormSelect,
  Banner,
} from '@coze-arch/bot-semi';
import { type BotSpace, SpaceType } from '@coze-arch/bot-api/developer_api';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { IconTeamDefault, IconWarningInfo } from '@coze-arch/bot-icons';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';

import { InputWithCountField } from '../input-with-count';

import s from './index.module.less';

interface SelectSpaceModalProps {
  visible: boolean;
  botName?: string;
  onCancel?: () => void;
  onConfirm?: (spaceId: string, botName?: string) => void;
}

export const SelectSpaceModal: React.FC<
  PropsWithChildren<SelectSpaceModalProps>
> = ({ visible, botName, onCancel, onConfirm }) => {
  const { pageFrom } = usePageRuntimeStore(state => ({
    pageFrom: state.pageFrom,
  }));
  const { hasWorkflow } = useBotSkillStore(state => ({
    hasWorkflow: !!state.workflows.length,
  }));
  const {
    space: { id, hide_operation },
  } = useSpaceStore();

  const { spaces: list = [] } = useSpaceList(true);
  const [loading, setLoading] = useState(false);
  const form = useRef<Form<{ name: string; spaceId: string }>>(null);
  useEffect(() => {
    setLoading(false);
    if (visible) {
      form.current?.formApi.setValue(
        'spaceId',
        hide_operation
          ? list?.[0].id ?? ''
          : id ?? useSpaceStore.getState().getPersonalSpaceID() ?? '',
      );
    }
  }, [visible, list]);

  const copyAddonAfter = `(${I18n.t('duplicate_rename_copy')})`;

  const maxBotNameLength = botInputLengthService.getInputLengthLimit('botName');

  const maxBotNameLengthWithAddonAfter =
    maxBotNameLength - copyAddonAfter.length;

  const getBotName = () => {
    if (!botName) {
      return botName;
    }
    const botNameJoin = '...';

    const maxBotNameLengthWithJoin =
      maxBotNameLengthWithAddonAfter - botNameJoin.length;

    return botName.length > maxBotNameLength
      ? `${botName.slice(0, maxBotNameLengthWithJoin)}${botNameJoin}`
      : botName;
  };
  return (
    <UIModal
      type="action-small"
      title={`${I18n.t('binding_duplicate_card')} Bot`}
      visible={visible}
      onCancel={() => onCancel?.()}
      onOk={async () => {
        try {
          await form.current?.formApi.validate();
          setLoading(true);
          const params = form.current?.formApi.getValues();
          await onConfirm?.(params?.spaceId ?? '', params?.name);
        } catch {
          // If the review fails, you will go to this logic, and a custom exception will be reported at the calling interface.
          setLoading(false);
        }
      }}
      okButtonProps={{ loading }}
    >
      <div>
        {pageFrom === BotPageFromEnum.Store && hasWorkflow ? (
          <Banner
            fullMode={false}
            type="warning"
            description={I18n.t('mkpl_bot_duplicate_tips')}
            icon={<IconWarningInfo />}
            closeIcon={null}
          />
        ) : null}

        <Form ref={form}>
          {botName ? (
            <InputWithCountField
              initValue={`${getBotName()}${copyAddonAfter}`}
              field="name"
              label={I18n.t('bot_create_name')}
              noErrorMessage
              maxLength={maxBotNameLength}
              rules={[
                { required: true },
                {
                  validator: (_rule, value) => value?.trim() !== '',
                },
              ]}
              placeholder={I18n.t('bot_create_name_placeholder')}
              getValueLength={reactText => {
                if (typeof reactText === 'number') {
                  return reactText.toString().length;
                }
                return botInputLengthService.getValueLength(reactText);
              }}
            />
          ) : null}
          <UIFormSelect
            label={I18n.t('duplicate_select_workspace')}
            noLabel={botName ? false : true}
            field="spaceId"
            placeholder={I18n.t('select_team')}
            noErrorMessage
            className={classNames(s.select)}
            rules={[{ required: true }]}
            renderSelectedItem={(optionNode: BotSpace) =>
              optionNode.id ? (
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
              ) : null
            }
          >
            {list
              ?.filter(t => !t.hide_operation)
              ?.map(item => (
                <UIFormSelect.Option value={item.id} {...item} key={item.id}>
                  {item.icon_url ? (
                    <Avatar size="extra-small" src={item.icon_url} />
                  ) : (
                    <IconTeamDefault
                      className={classNames(s['select-item-icon'])}
                    />
                  )}
                  <div className={classNames(s['select-item-name'])}>
                    {item.name}
                  </div>
                  {item.space_type === SpaceType.Team && (
                    <UITag color="violet">{I18n.t('develop_team_team')}</UITag>
                  )}
                </UIFormSelect.Option>
              ))}
          </UIFormSelect>
        </Form>
      </div>
    </UIModal>
  );
};
