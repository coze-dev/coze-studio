/// <reference types='@coze-arch/bot-typings' />
/// <reference types='@coze-arch/bot-env/typings' />

declare const IS_DEV_MODE: boolean;

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
