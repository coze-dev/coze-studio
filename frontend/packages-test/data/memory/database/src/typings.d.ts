declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare const IS_BOE: boolean;
declare const IS_DEV_MODE: boolean;
declare const IS_OVERSEA: boolean;
declare const IS_OVERSEA_RELEASE: boolean;
declare const IS_PPE: boolean;
declare const IS_PROD: boolean;
declare const IS_RELEASE_VERSION: boolean;
