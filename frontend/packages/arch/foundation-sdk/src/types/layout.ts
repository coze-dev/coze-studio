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

export interface BackButtonProps {
  onClickBack: () => void;
}

/** Navigation bar custom button properties */
export interface NavBtnProps {
  // Required, Nav. Item navigation component unique key, highlighted when the route matches
  navKey: string;
  //button icon
  icon?: React.ReactNode;
  // button name
  label: string | React.ReactNode;
  // Suffix Node
  suffix?: string | React.ReactNode;
  // Show only in the default mode of the left navigation bar
  onlyShowInDefault?: boolean;
  // Button click callback
  onClick: (e: React.MouseEvent) => void;
}
