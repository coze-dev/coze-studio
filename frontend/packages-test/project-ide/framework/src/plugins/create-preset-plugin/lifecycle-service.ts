import { inject, injectable, postConstruct } from 'inversify';
import {
  ApplicationShell,
  DisposableCollection,
  type Disposable,
  Emitter,
  type CustomTitleType,
  type Event,
  EventService,
  MenuService,
} from '@coze-project-ide/client';

@injectable()
export class LifecycleService implements Disposable {
  @inject(ApplicationShell) shell: ApplicationShell;

  @inject(EventService) eventService: EventService;

  @inject(MenuService) menuService: MenuService;

  protected readonly onFocusEmitter = new Emitter<CustomTitleType>();

  readonly onFocus: Event<CustomTitleType> = this.onFocusEmitter.event;

  private disposable = new DisposableCollection(this.onFocusEmitter);

  @postConstruct()
  init() {
    this.disposable.push(
      this.shell.mainPanel.onDidChangeCurrent(title => {
        if (title) {
          this.onFocusEmitter.fire(title as CustomTitleType);
        }
      }),
    );
  }

  dispose() {
    this.disposable.dispose();
  }
}
