import { createContext, type RefObject, useContext } from 'react';

export interface PublishContainerContextProps {
  getContainerRef: () => RefObject<HTMLDivElement> | null;
  /** 发布渠道的布局受到顶部 header 高度影响 用这个变量将他们关联起来 */
  publishHeaderHeight: number;
  setPublishHeaderHeight: (height: number) => void;
}

export const PublishContainerContext =
  createContext<PublishContainerContextProps>({
    getContainerRef: () => null,
    publishHeaderHeight: 0,
    setPublishHeaderHeight: () => 0,
  });

export const usePublishContainer = () => useContext(PublishContainerContext);
