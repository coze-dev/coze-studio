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
