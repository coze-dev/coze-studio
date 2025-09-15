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

import { useCallback } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { usePersonaStore } from '@coze-studio/bot-detail-store/persona';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useModelStore } from '@coze-studio/bot-detail-store/model';
import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useQueryCollectStore } from '@coze-studio/bot-detail-store/query-collect';
import { useAuditInfoStore } from '@coze-studio/bot-detail-store/audit-info';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { type HistoryInfo } from '@coze-arch/bot-api/developer_api';
import { I18n } from '@coze-arch/i18n';
import { Toast, Modal } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { reporter } from '@coze-arch/logger';

// 尝试导入知识库数据集存储，如果不存在则忽略
let useDatasetStore: any = null;
try {
  useDatasetStore = require('@coze-data/knowledge-data-set-for-agent').useDatasetStore;
} catch (e) {
  // 如果模块不存在，则忽略
}

const revertConfirm = () =>
  new Promise(resolve => {
    Modal.warning({
      title: I18n.t('workflow_publish_multibranch_revert_confirm_title'),
      content: I18n.t('workflow_publish_multibranch_revert_confirm_content'),
      okText: I18n.t('confirm'),
      cancelText: I18n.t('cancel'),
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });


/**
 * 完整初始化所有相关的store
 */
const initAllStoresWithBotData = (botData: any) => {
  const { initStore: initBotInfoStore } = useBotInfoStore.getState();
  const { initStore: initPersonaStore } = usePersonaStore.getState();
  const { initStore: initBotSkillStore } = useBotSkillStore.getState();
  const { initStore: initModelStore } = useModelStore.getState();
  const { initStore: initMultiAgentStore } = useMultiAgentStore.getState();
  const { initStore: initQueryCollectStore } = useQueryCollectStore.getState();
  const { initStore: initAuditInfoStore } = useAuditInfoStore.getState();

  // 按照 initBotDetailStore 的方式初始化所有store
  initBotInfoStore(botData);
  initPersonaStore(botData);
  initBotSkillStore(botData);
  initModelStore(botData);
  initMultiAgentStore(botData);
  initQueryCollectStore(botData);
  initAuditInfoStore(botData);

  // 处理知识库数据集存储
  if (useDatasetStore) {
    try {
      // 清空知识库数据集存储，让组件重新获取数据
      const { setDataSetList } = useDatasetStore.getState();
      setDataSetList([]);
    } catch (error) {
      console.warn('处理知识库数据集存储时出错:', error);
    }
  }

  // 重新触发页面初始化状态，让知识库组件重新获取数据
  try {
    const { setPageRuntimeBotInfo } = usePageRuntimeStore.getState();
    // 先设置为未初始化状态，然后重新设置为已初始化，触发重新加载
    setPageRuntimeBotInfo({ init: false });
    setTimeout(() => {
      setPageRuntimeBotInfo({ init: true });
    }, 100);
  } catch (error) {
    console.warn('重新触发页面初始化状态时出错:', error);
  }
};

export function useAgentHistoryAction() {
  const { botId, spaceId } = useBotInfoStore(
    useShallow((state: any) => ({
      botId: state.botId,
      spaceId: state.space_id,
    })),
  );

  const showCurrent = useCallback(async () => {
    // 重新加载当前版本的智能体数据，类似workflow的reloadDocument
    try {
      const response = await fetch(
        '/api/playground_api/draftbot/get_draft_bot_info',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space_id: spaceId,
            bot_id: botId,
            // 不传版本ID，获取最新版本
          }),
        },
      );

      const result = await response.json();
      if (result.code === 0 && result.data) {
        // 恢复到可编辑状态
        const { setPageRuntimeBotInfo } = usePageRuntimeStore.getState();
        setPageRuntimeBotInfo({ isPreview: false });

        // 使用完整的store初始化，确保所有资源都被更新
        initAllStoresWithBotData(result.data);
        // 强制清空知识库展示，避免残留（若历史/草稿有知识库，init 重新拉取会补回）
        try {
          const { useDatasetStore } = require('@coze-data/knowledge-data-set-for-agent');
          useDatasetStore.getState().setDataSetList([]);
        } catch (_) {
          // ignore
        }
      }
    } catch (error) {
      console.error('Failed to reload current version:', error);
      // 如果API调用失败，回退到刷新页面
      window.location.reload();
    }
  }, [botId, spaceId]);

  const resetToHistory = useCallback(
    async (item: HistoryInfo) => {
      const confirmed = await revertConfirm();

      if (!confirmed) {
        return;
      }

      // 发送智能体版本回滚事件 - 可以复用版本选择事件
      sendTeaEvent(EVENT_NAMES.bot_ppe_version_select, {
        bot_id: botId,
        workspace_id: spaceId,
        bot_version: item.version,
      });

      try {
        // 调用新的回滚API接口
        const response = await fetch('/api/ynet-agent/revert-draft-bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space_id: spaceId,
            bot_id: botId,
            version: item.version,
          }),
        });

        const result = await response.json();

        if (result.code === 0) {
          // 回滚成功
          reporter.successEvent({
            eventName: 'agent_revert_success',
            namespace: 'agent',
          });

          Toast.success({
            content: I18n.t('workflow_publish_multibranch_revert_success'),
            showClose: false,
          });

          // 回滚成功后重新加载当前版本的数据
          const reloadResponse = await fetch('/api/playground_api/draftbot/get_draft_bot_info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              space_id: spaceId,
              bot_id: botId,
              // 不传版本ID，获取最新版本（已经回滚后的版本）
            }),
          });

          const reloadResult = await reloadResponse.json();
          if (reloadResult.code === 0 && reloadResult.data) {
            // 恢复到可编辑状态
            const { setPageRuntimeBotInfo } = usePageRuntimeStore.getState();
            setPageRuntimeBotInfo({ isPreview: false });
            
            // 使用完整的store初始化，确保所有资源都被更新
            initAllStoresWithBotData(reloadResult.data);
            // 强制清空知识库展示，避免残留（随后根据草稿数据回填）
            try {
              const { useDatasetStore } = require('@coze-data/knowledge-data-set-for-agent');
              useDatasetStore.getState().setDataSetList([]);
            } catch (_) {
              // ignore
            }
          }

          return true;
        } else {
          throw new Error(result.msg || '版本回滚失败');
        }
      } catch (error) {
        reporter.errorEvent({
          eventName: 'agent_revert_fail',
          namespace: 'agent',
          error,
        });

        Toast.error({
          content:
            (error as Error).message ||
            I18n.t('workflow_publish_multibranch_revert_failed'),
          showClose: false,
        });

        return false;
      }
    },
    [botId, spaceId],
  );

  // 在当前页面加载历史版本（类似workflow的viewCommit）
  const viewHistoryInCurrentPage = useCallback(
    async (item: HistoryInfo) => {
      if (!item.version) {
        return;
      }

      // 发送智能体版本查看事件
      sendTeaEvent(EVENT_NAMES.bot_ppe_version_select, {
        bot_id: botId,
        workspace_id: spaceId,
        bot_version: item.version,
      });

      try {
        // 调用get_draft_bot_info接口获取特定版本的智能体信息
        const response = await fetch(
          '/api/playground_api/draftbot/get_draft_bot_info',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              space_id: spaceId,
              bot_id: botId,
              version: item.version, // 传入版本ID
            }),
          },
        );

        const result = await response.json();

        if (result.code === 0 && result.data) {
          // 成功获取到历史版本数据，以只读预览模式加载到store中
          // 先设置为预览模式，避免触发自动保存
          const { setPageRuntimeBotInfo } = usePageRuntimeStore.getState();
          setPageRuntimeBotInfo({ isPreview: true });

          // 使用完整的store初始化，确保所有资源（插件、工作流、知识库、记忆、对话体验等）都被更新
          initAllStoresWithBotData(result.data);
          // 强制清空知识库展示，避免沿用草稿（若该版本有知识库，会在 init 后自动回填）
          try {
            const { useDatasetStore } = require('@coze-data/knowledge-data-set-for-agent');
            useDatasetStore.getState().setDataSetList([]);
          } catch (_) {
            // ignore
          }

          return true;
        } else {
          throw new Error(result.msg || '获取版本数据失败');
        }
      } catch (error) {
        console.error('Failed to view history version:', error);

        Toast.error({
          content:
            (error as Error).message ||
            I18n.t('workflow_publish_multibranch_view_failed'),
          showClose: false,
        });

        return false;
      }
    },
    [botId, spaceId],
  );

  // 在新标签页打开历史版本（类似workflow的viewCommitNewPage）
  const viewHistoryInNewPage = useCallback(
    async (item: HistoryInfo) => {
      if (!item.version) {
        return;
      }

      // 发送智能体版本查看事件
      sendTeaEvent(EVENT_NAMES.bot_ppe_version_select, {
        bot_id: botId,
        workspace_id: spaceId,
        bot_version: item.version,
      });

      try {
        // 在新标签页打开特定版本的智能体页面
        // 使用主应用内路由，避免微应用入口造成空白或循环刷新
        const versionUrl = `/space/${spaceId}/bot/${botId}/arrange?version=${item.version}&readonly=true`;
        window.open(versionUrl, '_blank');

        return true;
      } catch (error) {
        console.error('Failed to view history version:', error);

        Toast.error({
          content:
            (error as Error).message ||
            I18n.t('workflow_publish_multibranch_view_failed'),
          showClose: false,
        });

        return false;
      }
    },
    [botId, spaceId],
  );

  return {
    resetToHistory,
    viewHistoryInCurrentPage,
    viewHistoryInNewPage,
    showCurrent,
    // 保持向后兼容，默认指向在当前页面查看
    viewHistory: viewHistoryInCurrentPage,
  };
}
