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

import { PluginMockDataGenerateMode } from '@coze-arch/bot-tea';

const LOCAL_STORAGE_KEY = 'mockset_auto_generate_latest_choice';

let latestAutoGenerationChoice = PluginMockDataGenerateMode.MANUAL;

async function getFromLocalStorage() {
  const info = await localStorage.getItem(LOCAL_STORAGE_KEY);
  if (Number(info) === PluginMockDataGenerateMode.LLM) {
    latestAutoGenerationChoice = PluginMockDataGenerateMode.LLM;
  } else {
    latestAutoGenerationChoice = PluginMockDataGenerateMode.RANDOM;
  }

  if (!info || Number.isNaN(Number(info))) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      String(PluginMockDataGenerateMode.RANDOM),
    );
  }
  return latestAutoGenerationChoice;
}

export function getLatestAutoGenerationChoice() {
  if (latestAutoGenerationChoice === PluginMockDataGenerateMode.MANUAL) {
    return getFromLocalStorage();
  } else {
    return latestAutoGenerationChoice;
  }
}

export function setLatestAutoGenerationChoice(
  choice: PluginMockDataGenerateMode.RANDOM | PluginMockDataGenerateMode.LLM,
) {
  latestAutoGenerationChoice = choice;
  localStorage.setItem(LOCAL_STORAGE_KEY, String(choice));
}
