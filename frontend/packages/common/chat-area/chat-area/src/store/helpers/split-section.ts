import { type MessageMeta } from '../types';
import { getIsVisibleMessageMeta as builtinGetIsVisibleMessageMeta } from '../../utils/message';
import { type ChatAreaConfigs } from '../../context/chat-area-context/type';

export interface UpdateSectionContextDividerParam {
  metaList: MessageMeta[];
  latestSectionId?: string;
  configs: ChatAreaConfigs;
  getIsVisibleMessageMeta?: typeof builtinGetIsVisibleMessageMeta;
}

/**
 * 从后向前扫描
 * 当前消息是第一条answer&
 * 前面有jumpVerbose消息才展示agent分割线
 */
export const updateMetaListDivider = (
  param: UpdateSectionContextDividerParam,
) => {
  const { metaList, configs, getIsVisibleMessageMeta } = param;
  updateDividerByScanList({
    metaList,
    configs,
    getIsVisibleMessageMeta,
  });
};

const updateDividerByScanList = (
  param: Omit<UpdateSectionContextDividerParam, 'latestSectionId'>,
) => {
  const {
    metaList,
    configs,
    getIsVisibleMessageMeta: inputGetIsVisibleMessageMeta,
  } = param;
  const getIsVisibleMessage =
    inputGetIsVisibleMessageMeta ?? builtinGetIsVisibleMessageMeta;

  const visibleMessageMeta = metaList.filter(meta =>
    getIsVisibleMessage(meta, configs),
  );
  if (visibleMessageMeta.length <= 1) {
    return;
  }

  // messageList 顺序是最新的存在前面
  // 渲染的时候有 reverse 需要注意
  for (let i = visibleMessageMeta.length - 1; i > 0; i--) {
    const next = visibleMessageMeta[i - 1];
    const current = visibleMessageMeta[i];

    if (!(current && next)) {
      return;
    }

    // 当前消息是第一条answer&前面有jumpVerbose消息才展示agent分割线
    if (next.beforeHasJumpVerbose && next.isGroupFirstAnswer) {
      next.showMultiAgentDivider = true;
    }
  }
};
