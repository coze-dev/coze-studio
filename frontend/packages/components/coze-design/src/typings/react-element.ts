import { type ElementType } from 'react';
import type React from 'react';

export interface RenderContentProps<T = HTMLElement> {
  initialFocusRef?: React.RefObject<T>;
}
export interface ITagProps {
  a: {
    attr: React.AnchorHTMLAttributes<HTMLAnchorElement>;
    ele: HTMLAnchorElement;
  };
  button: {
    attr: React.ButtonHTMLAttributes<HTMLButtonElement>;
    ele: HTMLButtonElement;
  };
  div: {
    attr: React.HTMLAttributes<HTMLDivElement>;
    ele: HTMLDivElement;
  };
  img: {
    attr: React.ImgHTMLAttributes<HTMLImageElement>;
    ele: HTMLImageElement;
  };
  input: {
    attr: React.InputHTMLAttributes<HTMLInputElement>;
    ele: HTMLInputElement;
  };
  label: {
    attr: React.LabelHTMLAttributes<HTMLLabelElement>;
    ele: HTMLLabelElement;
  };
  span: {
    attr: React.HTMLAttributes<HTMLSpanElement>;
    ele: HTMLSpanElement;
  };
}

export type GetTagProps<T extends ElementType> = T extends keyof ITagProps
  ? ITagProps[T]
  : ITagProps['button'];

export type BaseComponent = Pick<
  React.HTMLAttributes<HTMLElement>,
  | 'className'
  | 'id'
  | 'style'
  | 'onClick'
  | 'onMouseUp'
  | 'onMouseMove'
  | 'onMouseDown'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'onMouseOver'
  | 'onMouseOut'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onTouchStart'
  | 'onTouchMove'
  | 'onTouchEnd'
  | 'onScroll'
  | 'onDrop'
  | 'children'
> & {
  [rest: string]: unknown;
};

export type RenderContent<T = HTMLElement> = (
  props: RenderContentProps<T>,
) => React.ReactNode;
