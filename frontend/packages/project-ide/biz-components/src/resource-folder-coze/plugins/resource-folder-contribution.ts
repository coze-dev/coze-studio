import { inject, injectable, postConstruct } from 'inversify';
import { I18n } from '@coze-arch/i18n';
import {
  type CommandContribution,
  type CommandRegistry,
  ContextKeyService,
  RESOURCE_FOLDER_CONTEXT_KEY,
  type ResourceFolderShortCutContextType,
  type ShortcutsContribution,
  type ShortcutsRegistry,
} from '@coze-project-ide/framework';

import { BizResourceContextMenuBtnType } from '../type';
import { CustomResourceFolderShortcutService } from './shortcut-service';

const SHORTCUT_HANDLER_RESOURCE = 'resourceFolder';
@injectable()
export class ResourceFolderContribution
  implements CommandContribution, ShortcutsContribution
{
  @inject(CustomResourceFolderShortcutService)
  protected readonly shortcutService: CustomResourceFolderShortcutService;
  @inject(ContextKeyService)
  protected readonly contextKey: ContextKeyService;

  @postConstruct()
  init() {
    this.contextKey.setContext(RESOURCE_FOLDER_CONTEXT_KEY, undefined);
  }

  registerShortcuts(registry: ShortcutsRegistry): void {
    // 重命名
    registry.registerHandlers({
      commandId: BizResourceContextMenuBtnType.Rename,
      keybinding: 'enter',
      preventDefault: false,
      source: SHORTCUT_HANDLER_RESOURCE,
      when: RESOURCE_FOLDER_CONTEXT_KEY,
    });

    // 删除
    registry.registerHandlers({
      commandId: BizResourceContextMenuBtnType.Delete,
      keybinding: 'meta backspace',
      preventDefault: false,
      source: SHORTCUT_HANDLER_RESOURCE,
      when: RESOURCE_FOLDER_CONTEXT_KEY,
    });

    // 创建文件夹
    registry.registerHandlers({
      commandId: BizResourceContextMenuBtnType.CreateFolder,
      keybinding: 'alt shift n',
      preventDefault: false,
      source: SHORTCUT_HANDLER_RESOURCE,
      when: RESOURCE_FOLDER_CONTEXT_KEY,
    });

    // 创建资源
    registry.registerHandlers({
      commandId: BizResourceContextMenuBtnType.CreateResource,
      keybinding: 'alt n',
      preventDefault: false,
      source: SHORTCUT_HANDLER_RESOURCE,
      when: RESOURCE_FOLDER_CONTEXT_KEY,
    });

    // 创建副本
    registry.registerHandlers({
      commandId: BizResourceContextMenuBtnType.DuplicateResource,
      keybinding: 'alt d',
      preventDefault: false,
      source: SHORTCUT_HANDLER_RESOURCE,
      when: RESOURCE_FOLDER_CONTEXT_KEY,
    });
  }
  registerCommands(commands: CommandRegistry): void {
    // 重命名 command
    commands.registerCommand(
      {
        id: BizResourceContextMenuBtnType.Rename,
        label: I18n.t('project_resource_sidebar_rename'),
      },
      {
        execute: () => this.shortcutService.renameResource(),

        isEnabled: opt => !opt?.disabled,
        isVisible: opt => !opt?.isHidden,
      },
    );

    // 删除 command
    commands.registerCommand(
      {
        id: BizResourceContextMenuBtnType.Delete,
      },
      {
        execute: () => this.shortcutService.deleteResource(),
        isEnabled: opt => !opt?.disabled,
        isVisible: opt => !opt?.isHidden,
      },
    );

    // 新建文件夹 command
    commands.registerCommand(
      {
        id: BizResourceContextMenuBtnType.CreateFolder,
        label: I18n.t('project_resource_sidebar_create_new_folder'),
      },
      {
        execute: () => {
          const resourceFolderDispatch =
            this.contextKey.getContext<ResourceFolderShortCutContextType>(
              RESOURCE_FOLDER_CONTEXT_KEY,
            );
          resourceFolderDispatch?.onCreateFolder?.();
        },
        // 禁用文件夹创建
        isEnabled: opt => false, //!opt?.disabled,
        isVisible: opt => !opt?.isHidden,
      },
    );

    // 新建资源 command
    commands.registerCommand(
      {
        id: BizResourceContextMenuBtnType.CreateResource,
        label: 'Create Resource',
        shortLabel: 'Create Resource',
      },
      {
        execute: () => this.shortcutService.createResource(),
        isEnabled: opt => !opt?.disabled,
        isVisible: opt => !opt?.isHidden,
      },
    );
    // 新建副本 command
    commands.registerCommand(
      {
        id: BizResourceContextMenuBtnType.DuplicateResource,
        label: I18n.t('project_resource_sidebar_copy'),
      },
      {
        execute: () => this.shortcutService.duplicateResource(),
        isEnabled: opt => !opt?.disabled,
        isVisible: opt => !opt?.isHidden,
      },
    );
  }
}
