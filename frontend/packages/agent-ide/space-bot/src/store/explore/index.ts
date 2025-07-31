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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { I18n } from '@coze-arch/i18n';
import { type ExploreBotCategory } from '@coze-arch/bot-api/developer_api';

interface ExploreStore {
  selectedCategory: ExploreBotCategory;
}

interface ExploreAction {
  reset: () => void;
  setSelectedCategory: (category: ExploreBotCategory) => void;
}

export const getDefaultCategory: () => ExploreBotCategory = () => ({
  id: 'all',
  name: I18n.t('explore_bot_category_all'),
});

const initialStore: ExploreStore = {
  selectedCategory: getDefaultCategory(),
};

export const useExploreStore = create<ExploreStore & ExploreAction>()(
  devtools(
    set => ({
      ...initialStore,
      reset: () => {
        set(initialStore);
      },
      setSelectedCategory: category => {
        set({ selectedCategory: category });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.exploreStore',
    },
  ),
);
