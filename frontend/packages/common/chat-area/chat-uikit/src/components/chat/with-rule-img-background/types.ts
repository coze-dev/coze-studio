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

export interface GradientPosition {
  left?: number;
  right?: number;
}

export interface CanvasPosition {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

export interface BackgroundImageDetail {
  /** original image */
  origin_image_uri?: string;
  origin_image_url?: string;
  /** Actual use of pictures */
  image_uri?: string;
  image_url?: string;
  theme_color?: string;
  /** Gradual change of position */
  gradient_position?: GradientPosition;
  /** Crop canvas position */
  canvas_position?: CanvasPosition;
}

export interface BackgroundImageInfo {
  /** Web background cover */
  web_background_image?: BackgroundImageDetail;
  /** Mobile end background cover */
  mobile_background_image?: BackgroundImageDetail;
}
