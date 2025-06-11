import { useState } from 'react';

import { useProjectId, useSpaceId } from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import { FilterKnowledgeType } from '@coze-data/knowledge-modal-base';
import { useKnowledgeListModalContent } from '@coze-data/knowledge-modal-adapter';
import { useSelectDatabaseModal } from '@coze-data/database-v2';
import { I18n } from '@coze-arch/i18n';
import { UITabsModal } from '@coze-arch/bot-semi';
import { ResType, ResourceCopyScene } from '@coze-arch/bot-api/plugin_develop';

import SiderCategory from '../components/sider-category';
import { useResourceOperation } from './use-resource-operation';

type TabType = 'knowledge' | 'database';

const useImportData = () => {
  const [activeKey, setActiveKey] = useState<TabType>('knowledge');

  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const projectID = useProjectId();
  const spaceID = useSpaceId();

  const refetch = usePrimarySidebarStore(state => state.refetch);

  const resourceOperation = useResourceOperation({ projectId: projectID });

  const { renderContent, renderSearch } = useKnowledgeListModalContent({
    showFilters: ['scope-type', 'search-type'],
    datasetList: [],
    onDatasetListChange: async list => {
      if (list[0].dataset_id && list[0].name) {
        await resourceOperation({
          scene: ResourceCopyScene.CopyResourceFromLibrary,
          resource: {
            id: list[0].dataset_id,
            res_id: list[0].dataset_id,
            name: list[0].name,
            res_type: ResType.Knowledge,
          },
        });
        refetch();
        close();
      }
    },
    canCreate: false,
    defaultType: FilterKnowledgeType.ALL,
  });

  const {
    renderContent: renderDatabaseContent,
    renderFilter: renderDatabaseFilter,
    renderInput: renderDatabaseInput,
  } = useSelectDatabaseModal({
    visible: true,
    onClose: () => void 0,
    onAddDatabase: async id => {
      await resourceOperation({
        scene: ResourceCopyScene.CopyResourceFromLibrary,
        resource: {
          id,
          res_id: id,
          name: '',
          res_type: ResType.Database,
        },
      });
      refetch();
      close();
    },
    onClickDatabase: () => void 0,
    enterFrom: 'project',
    spaceId: spaceID,
  });

  const modal = (
    <UITabsModal
      keepDOM={false}
      visible={visible}
      onCancel={close}
      tabs={{
        tabsProps: {
          lazyRender: true,
          activeKey,
          onChange: (key: string) => setActiveKey(key as TabType),
        },
        tabPanes: [
          {
            tabPaneProps: {
              tab: I18n.t('resource_type_knowledge'),
              itemKey: 'knowledge',
            },
            content: (
              <div className="w-full h-full flex">
                <div className="w-[218px] pt-[16px] px-[12px] shrink-0 flex flex-col gap-[12px]">
                  {renderSearch()}
                  <SiderCategory
                    label={I18n.t('project_resource_modal_library_resources', {
                      resource: I18n.t('resource_type_knowledge'),
                    })}
                    selected
                  ></SiderCategory>
                </div>
                <div className="grow-[1] bg-[white] pt-[16px] px-[12px]">
                  {renderContent()}
                </div>
              </div>
            ),
          },
          {
            tabPaneProps: {
              tab: I18n.t('resource_type_database'),
              itemKey: 'database',
            },
            content: (
              <div className="w-full h-full flex">
                <div className="w-[218px] pt-[16px] px-[12px] shrink-0 flex flex-col gap-[12px]">
                  {renderDatabaseInput()}
                  <SiderCategory
                    label={I18n.t('project_resource_modal_library_resources', {
                      resource: I18n.t('resource_type_database'),
                    })}
                    selected
                  ></SiderCategory>
                </div>
                <div className="grow-[1] bg-[white] pt-[16px] px-[12px] flex flex-col">
                  {renderDatabaseFilter()}
                  {renderDatabaseContent()}
                </div>
              </div>
            ),
          },
        ],
      }}
    />
  );

  return { open, close, modal };
};

export default useImportData;
