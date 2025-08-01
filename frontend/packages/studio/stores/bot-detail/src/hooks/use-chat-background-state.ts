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

import { useBotSkillStore } from '../store/bot-skill';

export const useChatBackgroundState = () => {
  const backgroundState = useBotSkillStore(s => s.backgroundImageInfoList);

  const showBackground =
    !!backgroundState?.[0]?.mobile_background_image?.origin_image_url;
  const mobileBackGround =
    backgroundState?.[0]?.web_background_image?.origin_image_url;

  const pcBackground =
    backgroundState?.[0]?.web_background_image?.origin_image_url;

  return {
    showBackground,
    mobileBackGround,
    pcBackground,
    backgroundModeClassName: showBackground ? '!coz-fg-images-white' : '',
  };
};
