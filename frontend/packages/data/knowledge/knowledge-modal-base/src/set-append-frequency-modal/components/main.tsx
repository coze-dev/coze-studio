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

import { useState, useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';
import { type AuthFrequencyInfo } from '@coze-arch/bot-api/knowledge';
import { Toast, Modal } from '@coze-arch/coze-design';

import { saveSettingChange } from '../service/use-case/save-setting-change';
import { useInit } from '../hooks/life-cycle/use-init';
import { AccountFrequencyItem } from './account-frequency-item';

export const SetAppendFrequencyModal = (props: {
  datasetId: string;
  onFinish: () => void;
  onClose?: () => void;
}) => {
  const { datasetId, onFinish, onClose } = props;
  const [pendingAccounts, setPendingAccounts] = useState<AuthFrequencyInfo[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  const { initAccountList, initLoading } = useInit(datasetId);

  useEffect(() => {
    if (initAccountList) {
      setPendingAccounts(initAccountList);
    }
  }, [initAccountList]);

  return (
    <Modal
      // @ts-expect-error --TODO: hzf needs to be changed to i18n.
      title={I18n.t('设置追加频率')}
      className="w-[520px]"
      centered
      visible
      cancelText={I18n.t('Cancel')}
      okText={I18n.t('knowledge_optimize_007')}
      okButtonProps={{ loading: loading || initLoading }}
      onOk={async () => {
        try {
          setLoading(true);
          await saveSettingChange({
            datasetId,
            pendingAccounts,
          });
          Toast.success(I18n.t('Update_success'));
          onClose?.();
          onFinish();
        } catch {
          Toast.error(I18n.t('Update_failed'));
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        onClose?.();
        if (initAccountList) {
          setPendingAccounts(initAccountList);
        }
      }}
    >
      <>
        <div className="text-[14px] coz-fg-primary mb-[30px]">
          {/* @ts-expect-error --TODO: hzf needs to be changed to i18n. */}
          {I18n.t('设置追加频率后，当前频率自动追加')}
        </div>
        <div className="flex flex-col gap-2">
          {pendingAccounts.map(account => (
            <AccountFrequencyItem
              key={account.auth_id}
              accountInfo={account}
              onFrequencyChange={newAccount => {
                setPendingAccounts(prev =>
                  prev.map(item =>
                    item.auth_id === newAccount.auth_id ? newAccount : item,
                  ),
                );
              }}
            />
          ))}
        </div>
      </>
    </Modal>
  );
};
