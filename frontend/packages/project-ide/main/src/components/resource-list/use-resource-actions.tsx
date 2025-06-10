import {
  type ResourceFolderProps,
  type ResourceType,
} from '@coze-project-ide/framework';
import {
  type BizResourceContextMenuBtnType,
  type ResourceFolderCozeProps,
  type BizResourceType,
} from '@coze-project-ide/biz-components';

export const useResourceActionsDemo = () => {
  const onChangeName: ResourceFolderProps['onChangeName'] =
    async changeNameEvent => {
      // TODO: chaoyang805 在这里调接口重命名资源并校验
      await console.log('[ResourceFolder]on change name>>>', changeNameEvent);
    };

  const onDelete = async (resources: ResourceType[]) => {
    await console.log('[ResourceFolder]on delete>>>', resources);
  };

  const onCreate: ResourceFolderCozeProps['onCreate'] = async (
    createEvent,
    subType,
  ) => {
    await console.log('[ResourceFolder]on create>>>', createEvent, subType);
  };

  const onCustomCreate: ResourceFolderCozeProps['onCustomCreate'] = async (
    resourceType,
    subType,
  ) => {
    await console.log(
      '[ResourceFolder]on custom create>>>',
      resourceType,
      subType,
    );
  };

  const onAction = (
    action: BizResourceContextMenuBtnType,
    resource?: BizResourceType,
  ) => {
    console.log('on action>>>', action, resource);
  };
  return {
    onChangeName,
    onAction,
    onDelete,
    onCreate,
    onCustomCreate,
  };
};
