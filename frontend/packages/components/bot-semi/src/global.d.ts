/// <reference types='@coze-arch/bot-typings' />

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}
