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

export {
  useInitOpenPremiumManage,
  usePremiumManageModal,
  PremiumManage,
} from './components/premium-manage';

export {
  PremiumPaywallScene,
  useBenefitAvailable,
  usePremiumPaywallModal,
} from './components/premium-paywall';
export {
  useFetchKnowledgeBenefit,
  PremiumPaywallBannerScene,
  PremiumPaywallBanner,
} from './components/premium-paywall-banner';

import TelegramImage from './components/premium-manage/assets/telegram.svg';
import DiscordImage from './components/premium-manage/assets/discord.svg';

export { TelegramImage, DiscordImage };
