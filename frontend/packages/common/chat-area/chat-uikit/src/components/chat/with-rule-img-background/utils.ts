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
 
import { MODE_CONFIG } from './const';

// 输入透明度系数 和color 返回新的颜色
export function addAlpha(color: string, alpha: number): string {
  const regex = /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/;
  if (!regex.test(color)) {
    return color;
  }

  const values: string[] = color.slice(5, -1).split(',');
  values.push(alpha.toString());

  const newColor = `rgba(${values.join(',')})`;

  return newColor;
}

// 图片的宽高比
export const getStandardRatio = (mode: 'pc' | 'mobile'): number =>
  MODE_CONFIG[mode].size.width / MODE_CONFIG[mode].size.height;

// 计算是否展示渐变阴影 = 屏幕宽度 > 图片宽度 * （1- 2 * 左/右阴影位置）
export const computeShowGradient = (
  width: number,
  imgWidth: number,
  percent: number,
): boolean => width > imgWidth * (1 - (percent > 0 ? percent : 0) * 2);
