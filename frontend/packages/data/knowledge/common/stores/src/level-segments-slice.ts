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

import { type StateCreator } from 'zustand';

export interface ITableDetail {
  tableIdx: number | null;
  tableName: string | null;
  caption: string | null;
  text: string | null;
  cells: string | null;
}

export interface IImageDetail {
  base64: string | null;
  caption: string | null;
  links: string | null;
  token: string | null;
  name: string | null;
}

export interface ILevelSegment {
  id: number;
  block_id: number | null;
  slide_index: number | null;
  slice_id?: string;
  slice_sequence?: number;
  type:
    | 'title'
    | 'section-title'
    | 'section-text'
    | 'text'
    | 'image'
    | 'table'
    | 'caption'
    | 'header-footer'
    | 'header'
    | 'footer'
    | 'formula'
    | 'footnote'
    | 'toc'
    | 'code'
    | 'page-title';
  level: number;
  parent: number;
  children: number[];
  text: string;
  label: string;
  html_text: string;
  positions: string | null;
  table_detail: ITableDetail;
  image_detail: IImageDetail;
  file_detail: string | null;
}

export interface ILevelSegmentsState {
  levelSegments: ILevelSegment[];
}

export interface ILevelSegmentsAction {
  setLevelSegments: (segments: ILevelSegment[]) => void;
}

export type ILevelSegmentsSlice = ILevelSegmentsState & ILevelSegmentsAction;

export const getDefaultLevelSegmentsState = () => ({
  levelSegments: [],
});

export const createLevelSegmentsSlice: StateCreator<
  ILevelSegmentsSlice
> = set => ({
  ...getDefaultLevelSegmentsState(),
  setLevelSegments: (content: ILevelSegment[]) =>
    set(() => ({
      levelSegments: content,
    })),
});
