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

import { type LoadMoreEnvTools } from '../load-more-env-tools';
import { uniquePush } from '../../../utils/array';
import { type LoadAction } from '../../../store/message-index';

// Todo single test mutual exclusion, overlay logic
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
   * A response can only be adopted if it is completely consistent.
   * loadEagerly will forcibly end loadByScrollNext
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
