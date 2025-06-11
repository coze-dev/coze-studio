import { type DEFAULT_THEMES } from './default-themes';
import {
  type componentStatuses,
  type componentColors,
  type componentPositions,
  type componentSizes,
  type componentShapes,
  type baseColor,
  type bgVariant,
  type monochrome,
  type tone,
  type componentRadius,
} from './constants';

export type {
  ITagProps,
  GetTagProps,
  BaseComponent,
  RenderContent,
} from './react-element';

export type DataTheme = (typeof DEFAULT_THEMES)[number] | string;

export interface IComponentBaseProps {
  dataTheme?: DataTheme;
}

export type ComponentColors = (typeof componentColors)[number];

export type ComponentBaseColors = (typeof baseColor)[number];

export type ComponentPosition = (typeof componentPositions)[number];

export type ComponentShape = (typeof componentShapes)[number];

export type ComponentSize = (typeof componentSizes)[number];

export type ComponentRadius = (typeof componentRadius)[number];

export type ComponentStatus = (typeof componentStatuses)[number];

export type ComponentBgVariants = (typeof bgVariant)[number];

export type ComponentMonochrome = (typeof monochrome)[number];

export type ComponentTone = (typeof tone)[number];

export type ListOrItem<T> = T[] | T | Array<T | T[]>;

export type PickUnion<U, K extends string | number | symbol> = U extends K
  ? U
  : never;

export type OmitUnion<U, K extends string | number | symbol> = U extends K
  ? never
  : U;

export type PickType<T> = {
  [K in keyof T]: T[K];
};

export type CombineTypes<T, U> = {
  [K in keyof T | keyof U]: (T & U)[K];
};
