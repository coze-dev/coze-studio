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

import { create } from 'zustand';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import { defaultEntityAreaNumMap } from './config';
type MoreContentType = 'moreContent';

type AllEntityType = ProductEntityType | MoreContentType;

interface StoreProps {
  ableKeyBoardJumpDetail: boolean;
  setAbleKeyBoardJumpDetail: (flag: boolean) => void;
  inputValue: string;
  setInputValue: (valueIn: string) => void;
  contentLength: Partial<Record<AllEntityType, number>>;
  setContentLength: (type: AllEntityType, length: number) => void;
  resetAllContentLength: () => void;
  currentSelectedIndex: {
    type: AllEntityType;
    index: number;
  };
  setCurrentSelectIndex: (type: AllEntityType, index) => void;
  resetCurrentSelectIndex: () => void;
  changeCurrentSelectIndexByDirection: (direction: 0 | 1) =>
    | {
        isTop?: boolean;
        isBottom?: boolean;
      }
    | undefined;

  entityTypeIn: ProductEntityType;
  setEntityTypeIn: (entityType: ProductEntityType) => void;

  currentEntitySort: ProductEntityType[];
  setCurrentEntitySort: (entityTypeList: ProductEntityType[]) => void;
}

interface GetEntityTypeParams {
  currentEntityType: AllEntityType;
  direction: 0 | 1;
  contentLength: Partial<Record<AllEntityType, number>>;
  recursionStartEntityType?: AllEntityType;
  entityList: AllEntityType[];
}

const getEntityType = (params: GetEntityTypeParams): AllEntityType => {
  const {
    currentEntityType,
    direction,
    contentLength,
    recursionStartEntityType,
    entityList,
  } = params;
  if (direction === 1) {
    if (currentEntityType === entityList?.[entityList.length - 1]) {
      return recursionStartEntityType ?? currentEntityType;
    } else {
      const nextEntityType =
        entityList[entityList.indexOf(currentEntityType) + 1];
      // @ts-expect-error -- linter-disable-autofix
      if (contentLength[nextEntityType] <= 0) {
        return getEntityType({
          currentEntityType: nextEntityType,
          direction,
          contentLength,
          entityList,
          recursionStartEntityType:
            recursionStartEntityType ?? currentEntityType,
        });
      }
      return nextEntityType;
    }
  } else {
    if (currentEntityType === entityList?.[0]) {
      return recursionStartEntityType ?? currentEntityType;
    } else {
      const lastEntityType =
        entityList[entityList.indexOf(currentEntityType) - 1];
      // @ts-expect-error -- linter-disable-autofix
      if (contentLength[lastEntityType] <= 0) {
        return getEntityType({
          currentEntityType: lastEntityType,
          entityList,
          direction,
          contentLength,
          recursionStartEntityType:
            recursionStartEntityType ?? currentEntityType,
        });
      }
      return lastEntityType;
    }
  }
};

// eslint-disable-next-line max-lines-per-function
export const useSearchInputStore = create<StoreProps>((set, get) => ({
  currentEntitySort: [ProductEntityType.SaasPlugin],
  setCurrentEntitySort: (entityTypeList: ProductEntityType[]) => {
    set({
      currentEntitySort: entityTypeList,
    });
  },
  entityTypeIn: ProductEntityType.SaasPlugin,
  setEntityTypeIn: (entityType: ProductEntityType) => {
    set({
      entityTypeIn: entityType,
    });
  },
  // 这个标志位的含义是判断用户是否有通过键盘上下切换的操作, 如果有这个标志位是true, 这个时候就可以按enter跳转bot详情, 否则按下enter发起搜索
  ableKeyBoardJumpDetail: false,
  setAbleKeyBoardJumpDetail: (flag: boolean) => {
    set({ ableKeyBoardJumpDetail: flag });
  },
  inputValue: '',
  setInputValue: (valueIn: string) => {
    set({ inputValue: valueIn });
  },
  contentLength: { ...defaultEntityAreaNumMap },
  setContentLength: (type: AllEntityType, length: number) => {
    set({
      contentLength: {
        ...get().contentLength,
        [type]: length,
      },
    });
  },
  resetAllContentLength: () => {
    set({
      contentLength: { ...defaultEntityAreaNumMap },
    });
  },
  currentSelectedIndex: {
    type: ProductEntityType.SaasPlugin,
    index: -1,
  },
  setCurrentSelectIndex: (type: AllEntityType, index: number) => {
    set({
      currentSelectedIndex: {
        type,
        index,
      },
    });
  },
  resetCurrentSelectIndex: () => {
    const { currentEntitySort } = get();
    set({
      currentSelectedIndex: {
        type: currentEntitySort[0],
        index: -1,
      },
    });
  },
  changeCurrentSelectIndexByDirection: (direction: 0 | 1) => {
    const { currentSelectedIndex, contentLength, currentEntitySort } = get();

    if (direction === 1) {
      // 向下
      if (
        currentSelectedIndex.index + 1 >=
        // @ts-expect-error -- linter-disable-autofix
        contentLength[currentSelectedIndex.type]
      ) {
        const nextEntityType = getEntityType({
          currentEntityType: currentSelectedIndex.type,
          direction: 1,
          contentLength,
          entityList: [...currentEntitySort],
        });
        if (nextEntityType !== currentSelectedIndex.type) {
          set({
            currentSelectedIndex: {
              type: nextEntityType,
              index: 0,
            },
          });
        } else {
          return { isBottom: true };
        }
      } else {
        set({
          currentSelectedIndex: {
            type: currentSelectedIndex.type,
            index: currentSelectedIndex.index + 1,
          },
        });
      }
    } else {
      // 向上
      if (currentSelectedIndex.index <= 0) {
        const lastEntityType = getEntityType({
          currentEntityType: currentSelectedIndex.type,
          direction: 0,
          contentLength,
          entityList: [...currentEntitySort],
        });
        set({
          currentSelectedIndex: {
            type: lastEntityType,
            index:
              lastEntityType === currentSelectedIndex.type
                ? -1
                : (contentLength[lastEntityType] as number) - 1,
          },
        });

        if (lastEntityType === currentSelectedIndex.type) {
          return { isTop: true };
        }
      } else {
        set({
          currentSelectedIndex: {
            type: currentSelectedIndex.type,
            index: currentSelectedIndex.index - 1,
          },
        });
      }
    }
  },
}));
