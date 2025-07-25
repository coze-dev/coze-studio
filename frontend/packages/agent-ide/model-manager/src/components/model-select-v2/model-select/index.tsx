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
 
import { useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isBoolean } from 'lodash-es';
import { useMount } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import {
  usePremiumStore,
  usePremiumType,
} from '@coze-studio/premium-store-adapter';
import {
  useBenefitAvailable,
  usePremiumManageModal,
  PremiumPaywallScene,
} from '@coze-studio/premium-components-adapter';

import { ModelSelectUI, type ModelSelectUIProps } from '../model-select-ui';

export interface ModelSelectProps extends ModelSelectUIProps {
  /**
   * 是否允许选择高级模型/新模型，否则内置弹窗拦截
   * 当不传或设置为 auto 时，则由组件内置判断用户是否是付费用户（国内专业版，海外 premium）
   * @default auto
   */
  canSelectSuperiorModel?: boolean | 'auto';
}

/**
 * 该组件相比 ModelSelectUI 单纯多了付费拦截功能
 */
export function ModelSelect({
  onModelChange,
  canSelectSuperiorModel: canSelectSuperiorModelProps,
  modalSlot,
  modelListExtraHeaderSlot,
  ...restProps
}: ModelSelectProps) {
  const { fetchPremiumPlan, fetchPremiumPlans } = usePremiumStore(
    useShallow(s => ({
      fetchPremiumPlans: s.fetchPremiumPlans,
      fetchPremiumPlan: s.fetchPremiumPlan,
    })),
  );
  // 国内：是否允许使用新模型/高级模型
  const isBenefitAvailable = useBenefitAvailable({
    scene: PremiumPaywallScene.NewModel,
  });

  /** 海外是否为 premium */
  const { isFree } = usePremiumType();

  const canSelectSuperiorModel = isBoolean(canSelectSuperiorModelProps)
    ? canSelectSuperiorModelProps
    : IS_OVERSEA
      ? !isFree
      : isBenefitAvailable;
  const [upgradeModalState, setUpgradeModalState] = useState<{
    type?: 'new' | 'advance';
    visible: boolean;
  }>({ visible: false });

  const { node: premiumManageModal, open: openPremiumModal } =
    usePremiumManageModal();

  useMount(() => {
    if (IS_OVERSEA) {
      fetchPremiumPlans().then(fetchPremiumPlan);
    }
  });

  return (
    <ModelSelectUI
      modelListExtraHeaderSlot={modelListExtraHeaderSlot}
      onModelChange={m => {
        const isFreeModel =
          !m.model_status_details?.is_new_model &&
          !m.model_status_details?.is_advanced_model;
        if (canSelectSuperiorModel || isFreeModel) {
          return onModelChange(m);
        }

        setUpgradeModalState({
          visible: true,
          type: m.model_status_details?.is_new_model ? 'new' : 'advance',
        });
        return false;
      }}
      modalSlot={
        <>
          <Modal
            // ModelSelect 用到的 Popover 组件弹层默认 z-index 为 1030
            zIndex={1031}
            visible={upgradeModalState.visible}
            title={
              upgradeModalState.type === 'new'
                ? I18n.t('model_list_upgrade_to_pro_version')
                : I18n.t('model_list_upgrade_to_pro_version_advancedModel')
            }
            cancelText={I18n.t('Cancel')}
            okText={I18n.t('model_list_upgrade_button')}
            onOk={() => {
              if (IS_CN_REGION) {
                openPremiumModal();
                // 这么操作是为了在关闭动画过程中防止 modal 内容跳变
                setUpgradeModalState(s => ({ ...s, visible: false }));
              } else {
                window.open('/premium', '_blank');
              }
              setUpgradeModalState(s => ({ ...s, visible: false }));
            }}
            onCancel={() =>
              setUpgradeModalState(s => ({ ...s, visible: false }))
            }
          >
            {upgradeModalState.type === 'new'
              ? I18n.t('model_list_ensure_service_quality')
              : I18n.t('model_list_upgrade_to_pro_advanced_tips')}
          </Modal>
          {modalSlot}
          {premiumManageModal}
        </>
      }
      {...restProps}
    />
  );
}
