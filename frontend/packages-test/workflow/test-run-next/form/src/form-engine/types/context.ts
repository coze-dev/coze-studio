type JSXComponent =
  | keyof JSX.IntrinsicElements
  | React.JSXElementConstructor<any>;

export type FormSchemaReactComponents = Record<string, JSXComponent>;
