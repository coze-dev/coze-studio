export const enum GrabElementType {
  IMAGE = 'image',
  LINK = 'link',
}

export interface GrabText {
  text: string;
}

export interface GrabElement {
  children: GrabNode[];
}

export interface GrabLinkElement extends GrabElement {
  url: string;
  type: GrabElementType.LINK;
}

export interface GrabImageElement extends GrabElement {
  src: string;
  type: GrabElementType.IMAGE;
}

export type GrabNode =
  | GrabElement
  | GrabLinkElement
  | GrabImageElement
  | GrabText;
