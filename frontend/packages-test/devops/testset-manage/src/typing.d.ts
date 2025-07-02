/// <reference types='@coze-arch/bot-typings' />

declare module '*.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;

  const content: any;
  export default content;
}

// declare const IS_OVERSEA: boolean;
