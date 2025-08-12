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

import { type AnimationEventHandler } from 'react';

import classNames from 'classnames';
import { ConnectorClassification } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozInfoCircle,
  IconCozDiamondFill,
} from '@coze-arch/coze-design/icons';
import { Tooltip, Space } from '@coze-arch/coze-design';
import {
  useBenefitAvailable,
  PremiumPaywallScene,
  usePremiumPaywallModal,
} from '@coze-studio/premium-components-adapter';

import styles from './connector-group-header.module.less';

interface ConnectorGroupHeaderProps {
  label: string;
  tooltipContent: string;
  showTooltipInfo: boolean;
  isHighlight: boolean;
  type: ConnectorClassification;
  onAnimationEnd: AnimationEventHandler<HTMLDivElement>;
}

export function ConnectorGroupHeader({
  label,
  tooltipContent,
  showTooltipInfo,
  isHighlight,
  type,
  onAnimationEnd,
}: ConnectorGroupHeaderProps) {
  // paywall
  const isAPIOrSDK = type === ConnectorClassification.APIOrSDK;
  const isAvailable = useBenefitAvailable({
    scene: PremiumPaywallScene.API,
  });
  const { node: premiumPaywallModal, open: openPremiumPaywallModal } =
    usePremiumPaywallModal({ scene: PremiumPaywallScene.API });

  return (
    <div
      className={classNames(
        'mb-8px px-2px coz-fg-secondary flex items-center gap-x-4px',
        isHighlight && styles.highlight,
      )}
      onAnimationEnd={onAnimationEnd}
    >
      <p className="text-[14px] font-[500] leading-[20px]">{label}</p>
      {isAPIOrSDK && !isAvailable ? (
        <Space className="text-[12px] ml-[8px]" spacing={2}>
          <IconCozDiamondFill className="coz-fg-hglt" />
          {I18n.t('coze_quota_exemption_notice', {
            link: (
              <div
                className="coz-fg-hglt cursor-pointer"
                onClick={openPremiumPaywallModal}
              >
                {I18n.t('coze_upgrade_package')}
              </div>
            ),
          })}
        </Space>
      ) : null}
      {showTooltipInfo ? (
        <Tooltip theme="dark" trigger="hover" content={tooltipContent}>
          <IconCozInfoCircle className="text-xxl" />
        </Tooltip>
      ) : null}
      {premiumPaywallModal}
    </div>
  );
}
