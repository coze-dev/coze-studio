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

import { inject, injectable, named } from 'inversify';
import {
  Disposable,
  type SchemaDecoration,
  ContributionProvider,
} from '@flowgram-adapter/common';

import { type ColorDefinition, type ThemeType } from '../types';
import { ColorContribution } from './color-contribution';

type ColorSchemaType = SchemaDecoration & {
  properties: {
    [key: string]: SchemaDecoration;
  };
};

@injectable()
class ColorService {
  @inject(ContributionProvider)
  @named(ColorContribution)
  colorContributions: ContributionProvider<ColorContribution>;

  /** Color chart */
  private colors: Record<string, ColorDefinition> = {};

  /** Color schema */
  private schema: ColorSchemaType = { type: 'object', properties: {} };

  /** Color preference schema */
  // private referenceSchema = { type: 'string', enum: [], enumDescriptions: [] };

  init() {
    this.colorContributions.getContributions().forEach(contribution => {
      contribution.registerColors(this);
    });
  }

  /**
   * Bulk registration color
   */
  register(...colors: ColorDefinition[]): Disposable[] {
    return colors.map(definition => {
      const { id } = definition;
      this.colors[id] = definition;
      this.schema.properties[id] = {
        type: 'string',
        description: definition.description,
      };
      return Disposable.create(() => this.deregisterColor(id));
    });
  }

  /**
   * Logout color
   */
  deregisterColor(id: string): void {
    delete this.colors[id];
    delete this.schema.properties[id];
  }

  /**
   * Get all color definitions
   */
  getColors(): ColorDefinition[] {
    return Object.keys(this.colors).map(id => this.colors[id]);
  }

  getColor(id: string) {
    return this.colors[id];
  }

  /**
   * Gets the color value of the specified theme
   */
  getThemeColor(id: string, themeType: ThemeType) {
    const color = this.getColor(id);
    let value = color.defaults?.[themeType];
    // Color values can be inherited from other color values
    if (
      value &&
      typeof value === 'string' &&
      !value.startsWith('#') &&
      !value?.startsWith('rgb')
    ) {
      const parentColor = this.colors[value];
      value = parentColor?.defaults?.[themeType];
    }
    return value;
  }

  toCssColor(id: string, themeType: ThemeType) {
    // Convert to variable name
    const variableName = `--${id.replace(/\./g, '-')}`;
    const value = this.getThemeColor(id, themeType);
    return `${variableName}: ${value};`;
  }

  /**
   * All color values are converted to CSS variables
   */
  toCss(themeType: ThemeType) {
    return `body {\n${this.getColors()
      .map(color => this.toCssColor(color.id, themeType))
      .join('\n')}\n}`;
  }
}

export { ColorService };
