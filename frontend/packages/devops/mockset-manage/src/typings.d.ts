/// <reference types='@coze-arch/bot-typings' />

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;

  /**
   * The default export type depends on the svgDefaultExport config,
   * it can be a string or a ReactComponent
   * */
  const content: any;
  export default content;
}

declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare const IS_OVERSEA: boolean;

declare const IS_PROD: boolean;

declare const IS_RELEASE_VERSION: boolean;

declare const IS_BOE: boolean;
