import { type RefObject, useEffect } from 'react';

/**
 * 点击赞、踩按钮，可以关闭打开原因填写面板
 * 填写面板关闭的时候, 会造成一次 Reflow。此时赞、踩按钮的位置会发生变化， 鼠标已经不在按钮上，但是对应按钮元素不会处罚 mouseleave 事件
 * 由于不触发 mouseleave 造成按钮上的 tooltip 不消失、错位等问题
 * 所以需要在面板 visible 变化时 patch 一个 mouseleave 事件
 */
export const useDispatchMouseLeave = (
  ref: RefObject<HTMLDivElement>,
  isFrownUponPanelVisible: boolean,
) => {
  useEffect(() => {
    ref.current?.dispatchEvent(
      new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, [isFrownUponPanelVisible, ref.current]);
};
