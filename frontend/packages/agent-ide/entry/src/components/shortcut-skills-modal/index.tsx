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

/* eslint-disable @coze-arch/max-line-per-function */
import classNames from 'classnames';
import { type ModalProps } from '@douyinfe/semi-foundation/lib/es/modal/modalFoundation';
import { useWorkflowModalParts } from '@coze-workflow/components';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { KnowledgeListModalContent } from '@coze-data/knowledge-modal-adapter';
import { I18n } from '@coze-arch/i18n';
import { UITabsModal } from '@coze-arch/bot-semi';
import { PageType, SceneType, usePageJumpResponse } from '@coze-arch/bot-hooks';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { type PluginApi, WorkflowMode } from '@coze-arch/bot-api/developer_api';
import { type PluginModalModeProps } from '@coze-agent-ide/plugin-shared';
import { usePluginModalParts } from '@coze-agent-ide/bot-plugin-export/agentSkillPluginModal/hooks';

import { isNonNull } from './utils';

import s from './index.module.less';

export interface SkillsModalProps
  extends Partial<ModalProps>,
    PluginModalModeProps {
  tabs: ('plugin' | 'workflow' | 'datasets' | 'imageFlow')[];
  tabsConfig?: {
    plugin?: {
      list: PluginApi[];
      onChange: (list: PluginApi[]) => void;
    };
    workflow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
    datasets?: {
      list: Dataset[];
      onChange: (list: Dataset[]) => void;
    };
    imageFlow?: {
      list: WorkFlowItemType[];
      onChange: (list: WorkFlowItemType[]) => void;
    };
  };
}

const SCENE_TAB_MAP: Partial<
  Record<SceneType, 'tools' | 'workflow' | 'datasets' | 'imageFlow'>
> = {
  [SceneType.WORKFLOW__BACK__BOT]: 'workflow',
};

export function SkillsModal({
  tabsConfig,
  openMode,
  openModeCallback,
  tabs,
  ...restModalProps
}: SkillsModalProps) {
  const {
    plugin: {
      list: pluginApiList = [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: onPluginApiListChange = () => {},
    } = {},
    workflow: {
      list: workFlowList = [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: onWorkFlowListChange = () => {},
    } = {},
    datasets: {
      list: datasetList = [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: onDatasetListChange = () => {},
    } = {},
    imageFlow: {
      list: imageFlowList = [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onChange: onImageFlowListChange = () => {},
    } = {},
  } = tabsConfig ?? {};
  const jumpResponse = usePageJumpResponse(PageType.BOT);
  const pluginModalParts = usePluginModalParts({
    pluginApiList,
    onPluginApiListChange,
    openModeCallback,
    openMode,
  });

  const workflowModalParts = useWorkflowModalParts({
    workFlowList,
    onWorkFlowListChange,
    onAdd: openModeCallback,
  });

  const imageFlowModalParts = useWorkflowModalParts({
    // If it is added only once/or multiple times, clear the default selection.
    workFlowList: imageFlowList,
    onWorkFlowListChange: onImageFlowListChange,
    flowMode: WorkflowMode.Imageflow,
    onAdd: openModeCallback,
  });

  const toolTabPane = {
    tabPaneProps: {
      tab: I18n.t('Tools'),
      itemKey: 'tools',
    },
    content: (
      <div className={s.main}>
        <div className={s.sider}>{pluginModalParts.sider}</div>
        <div className={s.content}>
          <div className={s.filter}>{pluginModalParts.filter}</div>
          <div className={s['content-inner']}>{pluginModalParts.content}</div>
        </div>
      </div>
    ),
  };

  const workflowTabPane = {
    tabPaneProps: {
      tab: I18n.t('Workflow'),
      itemKey: 'workflow',
    },
    content: (
      <div className={s.main}>
        <div className={s.sider}>{workflowModalParts.sider}</div>
        <div className={s.content}>
          {!!workflowModalParts.filter && (
            <div className={s.filter}>{workflowModalParts.filter}</div>
          )}
          <div className={s['content-inner']}>{workflowModalParts.content}</div>
        </div>
      </div>
    ),
  };

  const datasetTabPane = {
    tabPaneProps: {
      tab: I18n.t('Datasets'),
      itemKey: 'datasets',
    },
    content: (
      <div className={classNames(s.main, s['data-sets-content'])}>
        <KnowledgeListModalContent
          datasetList={datasetList}
          onDatasetListChange={onDatasetListChange}
        />
      </div>
    ),
  };

  const imageFlowTabPane = {
    tabPaneProps: {
      tab: I18n.t('imageflow_title'),
      itemKey: 'imageFlow',
    },
    content: (
      <div className={s.main}>
        <div className={s.sider}>{imageFlowModalParts.sider}</div>
        <div className={s.content}>
          {!!imageFlowModalParts.filter && (
            <div className={s.filter}>{imageFlowModalParts.filter}</div>
          )}
          <div className={s['content-inner']}>
            {imageFlowModalParts.content}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <UITabsModal
      visible
      tabs={{
        tabsProps: {
          lazyRender: true,
          defaultActiveKey: jumpResponse?.scene
            ? SCENE_TAB_MAP[jumpResponse.scene] || 'tools'
            : 'tools',
        },
        tabPanes: tabs
          .map(tab => {
            if (tab === 'plugin') {
              return toolTabPane;
            }
            if (tab === 'workflow') {
              return workflowTabPane;
            }
            if (tab === 'datasets') {
              return datasetTabPane;
            }
            if (tab === 'imageFlow') {
              return imageFlowTabPane;
            }
            return null;
          })
          .filter(isNonNull),
      }}
      {...restModalProps}
    />
  );
}

// TODO: Follow-up additions will add new skills that need to be used
// export const useSkillsModal = (props: SkillsModalProps) => {
//   const pageJumpResp = usePageJumpResponse(PageType.BOT);
//   // const [visible, setVisible] = useState(
//   //   pageJumpResp?.scene === SceneType.WORKFLOW__BACK__BOT &&
//   //     pageJumpResp.agentID === agentId &&
//   //     !!pageJumpResp.workflowModalState,
//   // );
//   const [visible, setVisible] = useState(false);
//   const close = () => {
//     setVisible(false);
//   };
//   const open = () => {
//     setVisible(true);
//   };
//   useEffect(() => {
//     if (visible) {
//       pageJumpResp?.clearScene();
//     }
//   }, []);
//   return {
//     node: visible ? <SkillsModal {...props} onCancel={close} /> : null,
//     close,
//     open,
//   };
// };
