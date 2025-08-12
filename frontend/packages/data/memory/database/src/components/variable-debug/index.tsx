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

import { useEffect, useState } from 'react';

import classNames from 'classnames';
import { useReactive } from 'ahooks';
import { IconAlertCircle } from '@douyinfe/semi-icons';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { dataReporter, DataNamespace } from '@coze-data/reporter';
import { BotE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  Modal,
  Spin,
  Toast,
  Tooltip,
  Typography,
  UIButton,
  UIInput,
} from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import type { KVItem } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { formatDate } from '../../utils';

import s from './index.module.less';

const { Paragraph } = Typography;
/* eslint-disable */

const ProfileInput = ({
  className,
  value,
  botId,
  keyword,
  onClear,
  afterUpdate,
}: {
  className?: string;
  value?: string;
  botId: string;
  keyword: string;
  onClear: () => void;
  afterUpdate?: () => void;
}) => {
  const [inputV, setInputV] = useState(value);
  useEffect(() => setInputV(value), [value]);
  const onUpdate = async () => {
    try {
      if (inputV === value) {
        return;
      }
      const resp = (await MemoryApi.SetKvMemory({
        bot_id: botId,
        data: [{ keyword, value: inputV }],
      })) as { code: number };
      if (resp.code === 0) {
        Toast.success({
          content: I18n.t('Update_success'),
          showClose: false,
        });
        afterUpdate?.();
      } else {
        Toast.warning({
          content: I18n.t('Update_failed'),
          showClose: false,
        });
      }
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.VARIABLE, {
        eventName: REPORT_EVENTS.VariableSetValue,
        error:
          error instanceof Error
            ? error
            : new CustomError(
                REPORT_EVENTS.VariableSetValue,
                `${REPORT_EVENTS.VariableSetValue}: operation fail`,
              ),
        meta: {
          bot_id: botId,
        },
      });
    }
  };
  return (
    <div
      className={className}
      data-dtestid={`${BotE2e.BotVariableDebugModalValueInput}.${keyword}`}
    >
      <UIInput
        showClear
        value={inputV}
        onChange={v => setInputV(v)}
        onClear={onClear}
        onBlur={onUpdate}
      />
    </div>
  );
};

export const VariableDebug = () => {
  const botId = useBotInfoStore(store => store.botId);
  const variables = useBotSkillStore(store => store.variables);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const $list = useReactive({
    current: [] as (KVItem & { loading?: boolean })[],
  });
  const getKvList = async () => {
    try {
      setLoading(true);

      const resp = await MemoryApi.GetPlayGroundMemory({
        bot_id: botId,
      });
      if (resp?.memories) {
        const data = variables.map(i => {
          const item = resp.memories?.find(j => j.keyword === i.key) || {};
          return {
            ...item,
            keyword: i.key,
            loading: false,
          };
        });
        $list.current = data as KVItem[];
      }
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.VARIABLE, {
        eventName: REPORT_EVENTS.VariableGetValue,
        error:
          error instanceof Error
            ? error
            : new CustomError(
                REPORT_EVENTS.VariableSetValue,
                `${REPORT_EVENTS.VariableSetValue}: get list fail`,
              ),
        meta: {
          bot_id: botId,
        },
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getKvList();
  }, []);

  const onDelete = async (keyword?: string) => {
    try {
      const resp = (await MemoryApi.DelProfileMemory({
        bot_id: botId,
        keywords: keyword ? [keyword] : undefined,
      })) as unknown as { code: number };
      if (resp.code === 0) {
        Toast.success({
          content: I18n.t('variable_reset_succ_tips'),
          showClose: false,
        });
        getKvList();
      } else {
        Toast.warning({
          content: I18n.t('variable_reset_fail_tips'),
          showClose: false,
        });
      }
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.VARIABLE, {
        eventName: REPORT_EVENTS.VariableDeleteValue,
        error:
          error instanceof Error
            ? error
            : new CustomError(
                REPORT_EVENTS.VariableSetValue,
                `${REPORT_EVENTS.VariableSetValue}: operation fail`,
              ),
        meta: {
          bot_id: botId,
        },
      });
    }
  };
  return (
    <div className={s['variable-debug-container']}>
      <Spin spinning={loading}>
        <div className={s['modal-container-title']}>
          <div
            className={s.keyword}
            data-testid={BotE2e.BotVariableDebugModalNameTitleText}
          >
            {I18n.t('variable_field_name')}
          </div>
          <div
            className={s.value}
            data-testid={BotE2e.BotVariableDebugModalValueTitleText}
          >
            {I18n.t('variable_field_value')}
          </div>
          <div
            className={s.update_time}
            data-testid={BotE2e.BotVariableDebugModalEditDateTitleText}
          >
            {I18n.t('variable_edit_time')}
          </div>
        </div>
        {$list.current.map(i => {
          if (!i.keyword) {
            return null;
          }
          return (
            <div
              key={i.keyword}
              className={classNames(s['modal-container-row'], {
                [s.system_row]: i.is_system,
              })}
            >
              <div
                className={s.keyword}
                data-dtestid={`${BotE2e.BotVariableDebugModalNameText}.${i.keyword}`}
              >
                <Paragraph
                  ellipsis={{
                    rows: 1,
                    showTooltip: {
                      opts: {
                        style: {
                          maxWidth: 234,
                          wordBreak: 'break-word',
                        },
                      },
                    },
                  }}
                >
                  {i.keyword}
                </Paragraph>
              </div>
              {/* Is it a system field? */}
              {i.is_system ? (
                <Paragraph
                  data-dtestid={`${BotE2e.BotVariableDebugModalValueInput}.${i.keyword}`}
                  ellipsis={{
                    rows: 1,
                    showTooltip: {
                      opts: {
                        style: {
                          maxWidth: 234,
                          wordBreak: 'break-word',
                        },
                      },
                    },
                  }}
                >
                  {i.value}
                </Paragraph>
              ) : (
                <ProfileInput
                  className={s.value}
                  value={
                    i.value ||
                    variables?.find(item => item.key === i.keyword)
                      ?.default_value
                  }
                  keyword={i.keyword || ''}
                  botId={botId}
                  onClear={async () => {
                    await onDelete(i.keyword || '');
                  }}
                  afterUpdate={getKvList}
                />
              )}
              <div
                className={s.update_time}
                data-dtestid={`${BotE2e.BotVariableDebugModalEditDateText}.${i.keyword}`}
              >
                {i.update_time
                  ? formatDate(Number(i.update_time), 'YYYY-MM-DD HH:mm')
                  : ''}
              </div>
            </div>
          );
        })}
      </Spin>
      <div
        className={s['variable-debug-footer']}
        data-testid={BotE2e.BotVariableDebugModalResetBtn}
      >
        <Tooltip
          className={s['hover-tip']}
          showArrow
          content={I18n.t('variable_reset_tips')}
        >
          <UIButton
            type="tertiary"
            onClick={() => {
              sendTeaEvent(EVENT_NAMES.memory_click_front, {
                bot_id: botId,
                resource_type: 'variable',
                action: 'reset',
                source: 'bot_detail_page',
                source_detail: 'memory_preview',
              });
              setShowResetModal(true);
            }}
          >
            {I18n.t('variable_reset')}
          </UIButton>
        </Tooltip>
      </div>

      <Modal
        zIndex={9999}
        centered
        okType="danger"
        visible={showResetModal}
        onCancel={() => {
          setShowResetModal(false);
        }}
        title={I18n.t('variable_reset_confirm')}
        okText={I18n.t('variable_reset_yes')}
        cancelText={I18n.t('variable_reset_no')}
        keepDOM={false}
        maskClosable={false}
        icon={
          <IconAlertCircle size="extra-large" style={{ color: '#FF2710' }} />
        }
        onOk={async () => {
          await onDelete();
          setShowResetModal(false);
        }}
      >
        {I18n.t('variable_reset_tips')}
      </Modal>
    </div>
  );
};
