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
