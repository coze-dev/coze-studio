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

import { injectable, inject, named } from 'inversify';
import {
  ContributionProvider,
  DecorationStyle,
  Disposable,
} from '@flowgram-adapter/common';

import { type Theme } from '../types';
import { ThemeService } from '../theme/theme-service';
import { ColorService } from '../color';
import {
  StylingContribution,
  type ColorTheme,
  type Collector,
} from './styling-contribution';

@injectable()
class StylingService {
  @inject(ThemeService)
  protected readonly themeService: ThemeService;

  @inject(ColorService)
  protected readonly colorService: ColorService;

  @inject(ContributionProvider)
  @named(StylingContribution)
  protected readonly stylingContributions: ContributionProvider<StylingContribution>;

  static readonly PREFIX = 'flowide';

  /**
   * Move it to the map later, I haven't thought about it for the time being.
   */
  private cssElement: HTMLStyleElement | undefined;

  private css = new Map<string, HTMLStyleElement>();

  /**
   * Collect all css mounts to < head >
   */
  apply(theme: Theme) {
    const rules: string[] = [];
    const colorTheme: ColorTheme = {
      type: theme.type,
      label: theme.label,
      getColor: id => this.colorService.getThemeColor(id, theme.type),
    };
    const collector: Collector = {
      prefix: StylingService.PREFIX,
      add: rule => rules.push(rule),
    };
    const cssElement = DecorationStyle.createStyleElement('flowide-styles');

    this.stylingContributions
      .getContributions()
      .forEach(stylingContribution => {
        stylingContribution.registerStyle(collector, colorTheme);
      });
    const css = rules.join('\n');
    cssElement.innerHTML = css;

    this.clear();
    this.cssElement = cssElement;

    return Disposable.create(() => {
      this.clear();
    });
  }

  register(id: string, css: string) {
    const el = this.css.get(id) || DecorationStyle.createStyleElement(id);
    el.innerHTML = css;
    this.css.set(id, el);
    return Disposable.create(() => {
      document.head.removeChild(el);
      this.css.delete(id);
    });
  }

  clear() {
    if (this.cssElement) {
      document.head.removeChild(this.cssElement);
      this.cssElement = undefined;
    }
  }

  dispose() {
    this.clear();
  }
}

export { StylingService };
