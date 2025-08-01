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

export const setMobileBody = () => {
  const bodyStyle = document?.body?.style;
  const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
  if (bodyStyle && htmlStyle) {
    bodyStyle.minHeight = '0';
    htmlStyle.minHeight = '0';
    bodyStyle.minWidth = '0';
    htmlStyle.minWidth = '0';
  }
};

export const setPCBody = () => {
  const bodyStyle = document?.body?.style;
  const htmlStyle = document?.getElementsByTagName('html')?.[0]?.style;
  if (bodyStyle && htmlStyle) {
    bodyStyle.minHeight = '600px';
    htmlStyle.minHeight = '600px';
    bodyStyle.minWidth = '1200px';
    htmlStyle.minWidth = '1200px';
  }
};
