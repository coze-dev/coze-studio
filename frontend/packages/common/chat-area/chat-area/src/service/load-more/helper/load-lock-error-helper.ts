import { type LoadMoreEnvTools } from '../load-more-env-tools';
import { uniquePush } from '../../../utils/array';
import { type LoadAction } from '../../../store/message-index';

// todo 单测互斥、覆盖逻辑
export class LoadLockErrorHelper {
  constructor(private envTools: LoadMoreEnvTools) {}

  private getCurrentLoadLock(action: LoadAction) {
    const { readEnvValues } = this.envTools;
    const { loadLock } = readEnvValues();
    return loadLock[action];
  }

  public checkLoadLockUsing(action: LoadAction) {
    const selfLocked = this.getCurrentLoadLock(action) !== null;
    if (selfLocked) {
      return true;
    }
    const higherPriorityActions = this.getHigherPriorityAction(action);
    return higherPriorityActions.some(
      higherAction => this.getCurrentLoadLock(higherAction) !== null,
    );
  }

  public onLoadStart(action: LoadAction) {
    const now = Date.now();
    const { updateLockAndErrorByImmer } = this.envTools;
    updateLockAndErrorByImmer(state => {
      const { loadLock, loadError } = state;
      loadLock[action] = now;
      state.loadError = loadError.filter(errorAction => errorAction !== action);

      const coveredActions = this.getCoveredAction(action);
      coveredActions.forEach(covered => {
        loadLock[covered] = null;
        state.loadError = loadError.filter(
          errorAction => errorAction !== covered,
        );
      });
    });
    return {
      loadLock: now,
    };
  }

  private getHigherPriorityAction(action: LoadAction): LoadAction[] {
    if (action === 'load-next') {
      return ['load-eagerly'];
    }
    return [];
  }

  private getCoveredAction(action: LoadAction): LoadAction[] {
    if (action === 'load-eagerly') {
      return ['load-next'];
    }
    return [];
  }

  /**
   * 唯有完全一致方可采用响应，
   * loadEagerly 会强行终结 loadByScrollNext
   */
  public verifyLock(action: LoadAction, lock: number): boolean {
    const currentLock = this.envTools.readEnvValues().loadLock[action];
    return lock === currentLock;
  }

  public onLoadSuccess(
    action: LoadAction,
    opt?: {
      remainLock?: boolean;
    },
  ) {
    const { updateLockAndErrorByImmer } = this.envTools;
    updateLockAndErrorByImmer(state => {
      const { loadLock, loadError } = state;
      if (!opt?.remainLock) {
        loadLock[action] = null;
      }
      state.loadError = loadError.filter(load => load !== action);
    });
  }

  public onLoadError(action: LoadAction) {
    const { updateLockAndErrorByImmer } = this.envTools;
    updateLockAndErrorByImmer(state => {
      const { loadLock, loadError } = state;
      loadLock[action] = null;
      uniquePush(loadError, action);
    });
  }
}
