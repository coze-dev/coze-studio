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

import classNames from 'classnames';

export const getEditorTableClassname = () =>
  classNames(
    // table style
    '[&_table]:border-collapse [&_table]:m-0 [&_table]:w-full [&_table]:table-fixed [&_table]:overflow-hidden [&_table]:text-[0.9em]',
    '[&_table_td]:border [&_table_th]:border [&_table_td]:border-[#ddd] [&_table_th]:border-[#ddd]',
    '[&_table_td]:p-2 [&_table_th]:p-2',
    '[&_table_td]:relative [&_table_th]:relative',
    '[&_table_td]:align-top [&_table_th]:align-top',
    '[&_table_td]:box-border [&_table_th]:box-border',
    '[&_table_td]:border-solid [&_table_th]:border-solid',
    '[&_table_td]:min-w-[100px] [&_table_th]:min-w-[100px]',
  );
