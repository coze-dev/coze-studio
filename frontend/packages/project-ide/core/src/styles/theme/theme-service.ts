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

import { inject, injectable } from 'inversify';
import { Emitter, type Event, Disposable } from '@flowgram-adapter/common';

import { type Theme } from '../types';
import { PreferencesManager } from '../../preference';

interface ThemeDidChangeEvent {
  readonly next: Theme;
  readonly prev: Theme;
}

const DEFAULT_THEME: Theme = {
  id: 'flowide',
  type: 'dark',
  label: 'flow ide default theme',
};
const DEFAULT_LIGHT_THEME: Theme = {
  id: 'flowide',
  type: 'light',
  label: 'flow ide default theme',
};

@injectable()
class ThemeService {
  @inject(PreferencesManager)
  protected readonly preferencesManager: PreferencesManager;

  /** All registered themes */
  private themes: Map<string, Theme> = new Map([
    [DEFAULT_THEME.type, DEFAULT_THEME],
    [DEFAULT_LIGHT_THEME.type, DEFAULT_LIGHT_THEME],
  ]);

  /** Current theme */
  private current: Theme = DEFAULT_THEME;

  private readonly themeChange = new Emitter<ThemeDidChangeEvent>();

  readonly onDidThemeChange: Event<ThemeDidChangeEvent> =
    this.themeChange.event;

  init() {
    this.changeWithPreferences();
    // First manually trigger a change simulation to read the configuration from preference
    this.preferencesManager.onDidPreferencesChange(() => {
      this.changeWithPreferences();
    });
  }

  changeWithPreferences() {
    const type =
      this.preferencesManager.getPreferenceData('theme') || DEFAULT_THEME.type;
    this.themeChange.fire({
      next: {
        ...DEFAULT_THEME,
        type,
      },
      prev: this.current,
    });
  }

  /**
   * Register theme
   */
  register(...themes: Theme[]) {
    themes.forEach(theme => this.themes.set(theme.id, theme));
    return Disposable.create(() => {
      themes.forEach(theme => {
        if (theme && theme === this.current) {
          this.setCurrent(DEFAULT_THEME.id);
        }
        this.themes.delete(theme.id);
      });
    });
  }

  setCurrent(themeId: string): void {
    const next = this.themes.get(themeId);
    const prev = this.current;
    if (next && next !== prev) {
      this.current = next;
      this.themeChange.fire({ next, prev });
    }
  }

  getCurrent() {
    return this.current;
  }

  dispose() {
    this.themeChange.dispose();
  }
}

export { ThemeService };
