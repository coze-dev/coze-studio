declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const content: string;

  export { ReactComponent };
  export default content;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
