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

import { useTableData } from '../../context/table-data-context';

const ADD_BTN_HEIGHT = 56;

export const useScroll = () => {
  const { sliceListData } = useTableData();
  // Scroll table to the bottom
  const scrollTableBodyToBottom = () => {
    const bodyDom = document.querySelector(
      '.table-view-box .semi-table-container>.semi-table-body',
    );
    if (bodyDom && sliceListData?.list.length) {
      bodyDom.scrollTop = sliceListData?.list.length * ADD_BTN_HEIGHT;
    }
  };

  return {
    scrollTableBodyToBottom,
  };
};
