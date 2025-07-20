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

  /** 颜色表 */
  private colors: Record<string, ColorDefinition> = {};

  /** 颜色的 schema */
  private schema: ColorSchemaType = { type: 'object', properties: {} };

  /** 颜色偏好设置的 schema */
  // private referenceSchema = { type: 'string', enum: [], enumDescriptions: [] };

  init() {
    this.colorContributions.getContributions().forEach(contribution => {
      contribution.registerColors(this);
    });
  }

  /**
   * 批量注册 color
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
   * 注销 color
   */
  deregisterColor(id: string): void {
    delete this.colors[id];
    delete this.schema.properties[id];
  }

  /**
   * 获取所有的 color definition
   */
  getColors(): ColorDefinition[] {
    return Object.keys(this.colors).map(id => this.colors[id]);
  }

  getColor(id: string) {
    return this.colors[id];
  }

  /**
   * 获取指定 theme 的 color value
   */
  getThemeColor(id: string, themeType: ThemeType) {
    const color = this.getColor(id);
    let value = color.defaults?.[themeType];
    // 色值可以从其他色值继承
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
    // 转换为变量名
    const variableName = `--${id.replace(/\./g, '-')}`;
    const value = this.getThemeColor(id, themeType);
    return `${variableName}: ${value};`;
  }

  /**
   * 所有色值转化为 css 变量
   */
  toCss(themeType: ThemeType) {
    return `body {\n${this.getColors()
      .map(color => this.toCssColor(color.id, themeType))
      .join('\n')}\n}`;
  }
}

export { ColorService };
