import { inject, injectable } from 'inversify';
import {
  type CommandContribution,
  type CommandRegistry,
  type CustomTitleType,
  Command,
} from '@coze-project-ide/client';

import { ModalService, ModalType } from '@/services';

@injectable()
export class CloseConfirmContribution implements CommandContribution {
  @inject(ModalService) private modalService: ModalService;

  registerCommands(commands: CommandRegistry): void {
    commands.registerCommand(Command.Default.VIEW_SAVING_WIDGET_CLOSE_CONFIRM, {
      execute: (titles: CustomTitleType[]) => {
        const hasUnsaved = titles.some(title => title?.saving);
        if (hasUnsaved) {
          this.modalService.onModalVisibleChangeEmitter.fire({
            type: ModalType.CLOSE_CONFIRM,
            options: titles,
          });
        } else {
          titles.forEach(title => title?.owner?.close?.());
        }
      },
    });
  }
}
