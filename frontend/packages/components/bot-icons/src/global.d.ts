declare module '*.png' {
  const value: string;
  export default value;
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
