/**
 * 左侧添加节点面板的显示隐藏状态，需要被别的地方消费，所以抽象成一个全局 state
 */

import { create } from 'zustand';

interface AddNodeVisibleStore {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useAddNodeVisibleStore = create<AddNodeVisibleStore>(set => ({
  visible: true,
  setVisible: visible => set({ visible }),
}));
