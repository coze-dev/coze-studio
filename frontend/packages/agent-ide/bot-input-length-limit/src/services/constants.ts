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

import { type BotInputLengthConfig } from './type';

const CN_INPUT_LENGTH_CONFIG: BotInputLengthConfig = {
  botName: 20,
  botDescription: 500,
  onboarding: 300,
  onboardingSuggestion: 50,
  suggestionPrompt: 5000,
  projectName: 20,
  projectDescription: 500,
};

const OVERSEA_INPUT_LENGTH_CONFIG: BotInputLengthConfig = {
  botName: 40,
  botDescription: 800,
  onboarding: 800,
  onboardingSuggestion: 90,
  suggestionPrompt: 5000,
  projectName: 40,
  projectDescription: 800,
};

export const getBotInputLengthConfig = () =>
  IS_OVERSEA ? OVERSEA_INPUT_LENGTH_CONFIG : CN_INPUT_LENGTH_CONFIG;
