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

/* eslint-disable @coze-arch/max-line-per-function */
import { useRef, type FC } from 'react';

import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  GrabElementType,
  PublicEventNames,
  publicEventCenter,
} from '@coze-common/chat-area-plugin-message-grab';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type SpaceProps } from '@coze-arch/bot-semi/Space';
import {
  UIIconButton,
  UIToast,
  Space,
  Tooltip,
  UIModal,
  Form,
  UIFormTextArea,
  UIDropdown,
  UIDropdownMenu,
  UIDropdownItem,
} from '@coze-arch/bot-semi';
import {
  IconCopy,
  IconMore,
  IconQuotation,
  IconWaringRed,
} from '@coze-arch/bot-icons';
import { type FileVO } from '@coze-arch/bot-api/filebox';
import { fileboxApi } from '@coze-arch/bot-api';

import { FileBoxListType, type UseBotStore } from '../types';
import wrapperStyle from '../index.module.less';
import { type Result } from '../hooks/use-file-list';
import { COZE_CONNECTOR_ID } from '../const';

import s from './index.module.less';

export interface ActionButtonsProps {
  botId: string;
  record: FileVO;
  type: FileBoxListType;
  reloadAsync: () => Promise<Result>;
  setIsFrozenCurrentHoverCardId?: (v: boolean) => void;
  spaceProps?: SpaceProps;
  useBotStore?: UseBotStore;
  isStore?: boolean;
  onCancel?: () => void;
}

export const ActionButtons: FC<ActionButtonsProps> = props => {
  const {
    record,
    reloadAsync,
    setIsFrozenCurrentHoverCardId,
    spaceProps = {},
    botId,
    isStore = false,
    useBotStore,
    onCancel,
  } = props;

  const {
    FileName: name = '',
    Uri: uri = '',
    MainURL: url = '',
    Type: type,
  } = record;

  const grabPluginIdForDebug = usePageRuntimeStore(state => state.grabPluginId);
  const grabPluginIdForStore = useBotStore?.(state => state.grabPluginId) || '';

  const grabPluginId = isStore ? grabPluginIdForStore : grabPluginIdForDebug;

  const isImage = type === FileBoxListType.Image;

  const renameRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    UIToast.success(I18n.t(isImage ? 'filebox_0008' : 'filebox_0023'));
  };

  const handleDelete = () => {
    UIModal.error({
      title: I18n.t(isImage ? 'filebox_0013' : 'filebox_0022'),
      className: wrapperStyle['confirm-modal'],
      okButtonProps: {
        theme: 'solid',
        type: 'danger',
      },
      okText: I18n.t('Delete'),
      onOk: async () => {
        try {
          await fileboxApi.PublicBatchDeleteFiles({
            uris: [uri],
            detail_page_id: '',
            bot_id: botId,
            connector_id: COZE_CONNECTOR_ID,
          });
          UIToast.success(I18n.t(isImage ? 'filebox_0016' : 'filebox_0024'));
          reloadAsync();
        } catch (error) {
          dataReporter.errorEvent(DataNamespace.FILEBOX, {
            error: error as Error,
            eventName: REPORT_EVENTS.FileBoxDeleteFile,
          });
        }
      },
      icon: <IconWaringRed />,
    });
  };

  const handleRename = () => {
    const modal = UIModal.info({
      title: I18n.t('chatflow_agent_menu_rename'),
      className: wrapperStyle['confirm-modal'],
      content: (
        <Form<{ renamedValue: string }>
          initValues={{
            renamedValue: name,
          }}
          className={s['rename-form']}
        >
          <UIFormTextArea
            field="renamedValue"
            validate={(v: string) => {
              if (!v) {
                return I18n.t('file_name_cannot_be_empty');
              }
            }}
            noLabel
            ref={renameRef}
            maxCount={100}
            maxLength={100}
            rows={3}
            onChange={(v: string) => {
              modal.update({
                okButtonProps: {
                  disabled: !v,
                },
              });
            }}
          />
        </Form>
      ),
      okButtonProps: {
        theme: 'solid',
        type: 'primary',
      },
      okText: I18n.t('Confirm'),
      onOk: async () => {
        try {
          await fileboxApi.PublicUpdateFile({
            update_items: {
              file_name: renameRef.current?.value,
              uri,
            },
            detail_page_id: '',
            bot_id: botId,
            connector_id: COZE_CONNECTOR_ID,
          });
          UIToast.success(I18n.t('Update_success'));
          reloadAsync();
        } catch (error) {
          dataReporter.errorEvent(DataNamespace.FILEBOX, {
            error: error as Error,
            eventName: REPORT_EVENTS.FileBoxUpdateFile,
          });
        }
      },
      icon: null,
    });
  };

  const handleQuote = () => {
    publicEventCenter.emit(PublicEventNames.UpdateQuote, {
      grabPluginId,
      quote: [
        {
          type: isImage ? GrabElementType.IMAGE : GrabElementType.LINK,
          ...(isImage
            ? {
                src: url,
              }
            : { url }),
          children: [
            {
              text: name,
            },
          ],
        },
      ],
    });
    onCancel?.();
  };

  return (
    <Space spacing={0} {...spaceProps}>
      <Tooltip content={I18n.t('ask_quote')}>
        <UIIconButton
          icon={<IconQuotation />}
          className={s['action-button']}
          onClick={e => {
            e.stopPropagation();
            handleQuote();
          }}
        />
      </Tooltip>
      <Tooltip content={I18n.t('filebox_0007')}>
        <UIIconButton
          icon={<IconCopy />}
          className={s['action-button']}
          onClick={e => {
            e.stopPropagation();
            handleCopy(name);
          }}
        />
      </Tooltip>
      <UIDropdown
        render={
          <UIDropdownMenu>
            <UIDropdownItem
              onClick={e => {
                e.stopPropagation();
                handleRename();
              }}
            >
              {I18n.t('filebox_0010')}
            </UIDropdownItem>
            <UIDropdownItem
              onClick={e => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              {I18n.t('Delete')}
            </UIDropdownItem>
          </UIDropdownMenu>
        }
        onVisibleChange={v => {
          if (v) {
            setIsFrozenCurrentHoverCardId?.(true);
          } else {
            setIsFrozenCurrentHoverCardId?.(false);
          }
        }}
      >
        <UIIconButton
          icon={<IconMore />}
          className={s['action-button']}
          onClick={e => {
            e.stopPropagation();
          }}
        />
      </UIDropdown>
    </Space>
  );
};
