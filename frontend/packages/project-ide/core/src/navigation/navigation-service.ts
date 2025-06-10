import { inject, injectable } from 'inversify';
import { DisposableCollection } from '@flowgram-adapter/common';

import { URI, OpenerService } from '../common';
import { NavigationHistory } from './navigation-history';

@injectable()
class NavigationService {
  @inject(OpenerService)
  protected readonly openerService: OpenerService;

  @inject(NavigationHistory)
  protected readonly history: NavigationHistory;

  private disposable = new DisposableCollection();

  scheme = 'flowide';

  init() {
    this.history.init();
    this.disposable.pushAll([
      this.history,
      this.history.onPopstate(e => {
        this.openerService.open(e.uri);
      }),
    ]);
  }

  public async goto(uri: URI | string, replace = false, options?: any) {
    let gotoUri: URI;
    if (typeof uri === 'string') {
      gotoUri = new URI(`${this.scheme}://${uri}`);
    } else {
      gotoUri = uri;
    }
    this.history.pushOrReplace({ uri: gotoUri }, replace);
    await this.openerService.open(gotoUri, options);
  }

  public async back() {
    const location = this.history.back();
    if (location) {
      await this.openerService.open(location.uri);
    }
  }

  public async forward() {
    const location = this.history.forward();
    if (location) {
      await this.openerService.open(location.uri);
    }
  }

  public canGoBack() {
    return this.history.canGoBack();
  }

  public canGoForward() {
    return this.history.canGoForward();
  }

  get uri() {
    return this.history.location?.uri;
  }

  get onDidHistoryChange() {
    return this.history.onDidHistoryChange;
  }

  setScheme(scheme: string) {
    this.scheme = scheme;
  }

  dispose() {
    this.disposable.dispose();
  }
}

export { NavigationService };
