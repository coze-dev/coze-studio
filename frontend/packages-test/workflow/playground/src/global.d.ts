/// <reference types='@coze-arch/bot-typings' />
declare module '*.otf' {
  const content: string;
  export default content;
}

declare module '*.ttf' {
  const content: string;
  export default content;
}

// TODO: remove this
import '../node_modules/@tanstack/react-query/build/modern/types.d.ts'
