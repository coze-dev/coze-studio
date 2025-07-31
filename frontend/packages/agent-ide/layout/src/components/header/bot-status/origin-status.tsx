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

import { type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { I18n } from '@coze-arch/i18n';
import { IconCozLoading } from '@coze-arch/coze-design/icons';
import { Tag } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';
import {
  ConnectorDynamicStatus,
  type ConnectorInfo,
} from '@coze-arch/bot-api/developer_api';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import s from './style.module.less';

export function OriginStatus() {
  const { savingInfoSaving, savingInfoTime } = usePageRuntimeStore(
    useShallow(store => ({
      savingInfoSaving: store.savingInfo.saving,
      savingInfoTime: store.savingInfo.time,
    })),
  );

  return (
    <>
      <Tag
        color="primary"
        className="!bg-transparent !p-0 !text-xs"
        loading={savingInfoSaving}
        prefixIcon={savingInfoSaving ? <IconCozLoading /> : null}
      >
        {savingInfoSaving ? (
          <div className={s['status-tag-spin']}>
            <span>{I18n.t('bot_autosave_saving')}</span>
          </div>
        ) : (
          I18n.t('devops_publish_multibranch_auto_saved', {
            time: savingInfoTime,
          })
        )}
      </Tag>
    </>
  );
}

export const renderWarningContent = ({
  warningList,
  onCancel,
  readonly,
  deployButton = null,
}: {
  warningList: ConnectorInfo[];
  onCancel: () => void;
  readonly?: boolean;
  deployButton?: ReactNode;
}) => (
  <div className={s['warning-content']}>
    {/* TODO: Multiple abnormal status copies are subsequently returned by the interface. At present, only discord has abnormal status, so I can't go here. */}
    {warningList.length > 1 ? (
      <>
        <div className={s['title-box']}>
          <IconAlertCircle
            size="large"
            style={{ color: 'var(--semi-color-warning)' }}
          />
          <span className={s.title}>
            {I18n.t('bot_pulish_offline_modal_title2', {
              platform_number: warningList?.length,
            })}
          </span>
        </div>
        <div className={s.main}>
          {warningList?.map(item => (
            <div className={s['warning-list']}>
              <h4>{item.name}</h4>
              <span>
                {I18n.t('bot_publish_offline_notice_no_certain_time', {
                  platform: item.name,
                })}
              </span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <>
        <div className={s['title-box']}>
          <IconAlertCircle
            size="large"
            style={{ color: 'var(--semi-color-warning)' }}
          />
          <span className={s.title}>
            {warningList[0].connector_status === ConnectorDynamicStatus.Offline
              ? I18n.t('bot_pulish_offline_modal_title1', {
                  platform: warningList[0].name,
                })
              : warningList[0].name}
          </span>
        </div>
        <div className={s.main}>
          {warningList[0].connector_status === ConnectorDynamicStatus.Offline
            ? I18n.t('bot_publish_offline_notice_no_certain_time', {
                platform: warningList[0].name,
              })
            : I18n.t('bot_publish_token_expired_notice', {
                platform: warningList[0].name,
              })}
        </div>
      </>
    )}
    {readonly ? (
      <div className={s.footer}>
        <UIButton theme="solid" type="warning" onClick={onCancel}>
          {I18n.t('devops_publish_multibranch_i_know')}
        </UIButton>
      </div>
    ) : (
      <div className={s.footer}>
        <UIButton
          theme="light"
          type="tertiary"
          className={s['cancel-btn']}
          onClick={onCancel}
        >
          {I18n.t('Cancel')}
        </UIButton>
        {deployButton}
      </div>
    )}
  </div>
);
