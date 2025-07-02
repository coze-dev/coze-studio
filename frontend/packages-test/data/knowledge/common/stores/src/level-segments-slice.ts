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
