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
import { Deferred, logger } from '@flowgram-adapter/common';

import { type LifecycleContribution } from '../common';
import { ThemeService } from './theme';
import {
  type StylingContribution,
  StylingService,
  type Collector,
  type ColorTheme,
} from './styling';
import { type ColorContribution, ColorService, colors } from './color';

@injectable()
class StylesContribution
  implements LifecycleContribution, ColorContribution, StylingContribution
{
  private ready = new Deferred<void>();

  registerColors(colorService: ColorService) {
    colorService.register(...colors);
  }

  registerStyle({ add }: Collector, { type }: ColorTheme) {
    add(this.colorService.toCss(type));
  }

  @inject(ColorService)
  protected readonly colorService: ColorService;

  @inject(ThemeService)
  protected readonly themeService: ThemeService;

  @inject(StylingService)
  protected readonly stylingService: StylingService;

  async onLoading() {
    this.colorService.init();
    this.themeService.onDidThemeChange(e => {
      this.stylingService.apply(e.next);
      this.ready.resolve();
    });
    this.themeService.init();
    await this.ready.promise;
    logger.log('theme loaded');
  }

  onDispose(): void {
    this.themeService.dispose();
    this.stylingService.dispose();
  }
}

export { StylesContribution };
