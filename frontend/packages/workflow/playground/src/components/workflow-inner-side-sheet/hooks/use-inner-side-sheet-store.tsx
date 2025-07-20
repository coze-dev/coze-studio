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
 
import { useShallow } from 'zustand/react/shallow';
import { create } from 'zustand';

export interface SingletonSideSheetProps {
  sideSheetId: string;
  // 关闭时的确认方法， 需要确认后才可关闭
  closeConfirm?: () => boolean | Promise<boolean>;
  // 是否和左侧面板互斥
  mutexWithLeftSideSheet?: boolean;
}

interface SideSheetMap {
  [id: string]: SingletonSideSheetProps;
}

interface InnerSideSheetStore {
  activeId?: string;
  sideSheetMap: SideSheetMap;
}

interface InnerSideSheetAction {
  forceUpdateActiveId: (id?: string) => void;
  registerSideSheet: (id: string, props: SingletonSideSheetProps) => void;
  unRegisterSideSheet: (id: string) => void;
  openSideSheet: (id: string) => Promise<boolean>;
  closeSideSheet: (id: string) => Promise<boolean>;
}

export const useInnerSideSheetStore = create<
  InnerSideSheetStore & InnerSideSheetAction
>((set, get) => ({
  activeId: undefined,
  forceUpdateActiveId: activeId => {
    set({ activeId });
  },
  sideSheetMap: {},
  registerSideSheet: (id, props: SingletonSideSheetProps) => {
    const { sideSheetMap } = get();
    sideSheetMap[id] = props;
    set({ sideSheetMap });
  },
  unRegisterSideSheet: id => {
    const { sideSheetMap } = get();
    if (sideSheetMap[id]) {
      delete sideSheetMap[id];
      set({ sideSheetMap });
    }
  },
  openSideSheet: async (sideSheetId: string) => {
    const { sideSheetMap } = get();

    // 获取除当前 sideSheet 外的所有关闭方法
    const closeFns = Object.keys(sideSheetMap).reduce((fns, id) => {
      const closeFn = sideSheetMap[id].closeConfirm;

      if (id === sideSheetId || !closeFn) {
        return fns;
      }

      return [...fns, closeFn];
    }, [] as Array<() => boolean | Promise<boolean>>);

    // 调用全部关闭方法
    const closeResult = await Promise.all(closeFns.map(fn => fn()));

    const success = !closeResult.some(result => result === false);

    if (success) {
      // 开启成功，将 active 状态切换到当前弹窗
      set({ activeId: sideSheetId });
    }

    return success;
  },
  closeSideSheet: async (sideSheetId: string) => {
    const { sideSheetMap, activeId } = get();
    if (activeId !== sideSheetId) {
      return true;
    }

    const { closeConfirm } = sideSheetMap[sideSheetId] || {};
    const closed = await closeConfirm?.();
    if (closeConfirm && !closed) {
      // 关闭失败了，回退visible状态
      return false;
    }

    set({ activeId: undefined });
    return true;
  },
}));

export const useInnerSideSheetStoreShallow = () => {
  const store = useInnerSideSheetStore(
    useShallow(s => ({
      activeId: s.activeId,
      forceUpdateActiveId: s.forceUpdateActiveId,
      sideSheetMap: s.sideSheetMap,
      registerSideSheet: s.registerSideSheet,
      unRegisterSideSheet: s.unRegisterSideSheet,
      openSideSheet: s.openSideSheet,
      closeSideSheet: s.closeSideSheet,
    })),
  );

  return store;
};
