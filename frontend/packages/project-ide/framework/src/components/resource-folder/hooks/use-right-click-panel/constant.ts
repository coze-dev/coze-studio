export enum BaseResourceContextMenuBtnType {
  CreateFolder = 'resource-folder-create-folder',
  CreateResource = 'resource-folder-create-resource',
  EditName = 'resource-folder-edit-name',
  Delete = 'resource-folder-delete',
}

export const ContextMenuConfigMap: Record<
  BaseResourceContextMenuBtnType,
  {
    id: string;
    label: string;
    disabled?: boolean;
    executeName: string;
  }
> = {
  [BaseResourceContextMenuBtnType.CreateFolder]: {
    id: BaseResourceContextMenuBtnType.CreateFolder,
    label: 'Create Folder',
    executeName: 'onCreateFolder',
  },
  [BaseResourceContextMenuBtnType.CreateResource]: {
    id: BaseResourceContextMenuBtnType.CreateResource,
    label: 'Create Resource',
    executeName: 'onCreateResource',
  },
  [BaseResourceContextMenuBtnType.EditName]: {
    id: BaseResourceContextMenuBtnType.EditName,
    label: 'Edit Name',
    executeName: 'onEnter',
  },
  [BaseResourceContextMenuBtnType.Delete]: {
    id: BaseResourceContextMenuBtnType.Delete,
    label: 'Delete',
    executeName: 'onDelete',
  },
};
