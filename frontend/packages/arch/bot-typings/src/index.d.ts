/// <reference types='./data_item' />
/// <reference types='./navigator' />
/// <reference types='./window' />
/// <reference types='@coze-arch/bot-env/typings' />

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
declare module '*.css' {
  const resource: { [key: string]: string };
  export = resource;
}

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
